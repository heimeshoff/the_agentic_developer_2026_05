namespace Rebalancer.Tests;

public class PortfolioRebalancerShould
{
    // --- Validation behaviors ---

    [Fact]
    public void ThrowWhenTargetAllocationsAreEmpty()
    {
        var targets = Array.Empty<TargetAllocation>();
        var holdings = new[] { new Holding("AAPL", 10, 150m) };

        var exception = Assert.Throws<ArgumentException>(
            () => PortfolioRebalancer.Rebalance(targets, holdings));

        Assert.Contains("empty", exception.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Theory]
    [InlineData(50, 40)]      // sums to 90
    [InlineData(60, 60)]      // sums to 120
    [InlineData(33, 33)]      // sums to 66
    public void ThrowWhenTargetAllocationsDoNotSumTo100(decimal pctA, decimal pctB)
    {
        var targets = new[]
        {
            new TargetAllocation("AAPL", pctA),
            new TargetAllocation("GOOGL", pctB)
        };
        var holdings = new[]
        {
            new Holding("AAPL", 10, 150m),
            new Holding("GOOGL", 10, 100m)
        };

        var exception = Assert.Throws<ArgumentException>(
            () => PortfolioRebalancer.Rebalance(targets, holdings));

        Assert.Contains("100", exception.Message);
    }

    [Fact]
    public void ThrowWhenAnyTargetPercentageIsNegative()
    {
        var targets = new[]
        {
            new TargetAllocation("AAPL", -10m),
            new TargetAllocation("GOOGL", 110m)
        };
        var holdings = new[]
        {
            new Holding("AAPL", 10, 150m),
            new Holding("GOOGL", 10, 100m)
        };

        var exception = Assert.Throws<ArgumentException>(
            () => PortfolioRebalancer.Rebalance(targets, holdings));

        Assert.Contains("negative", exception.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Theory]
    [InlineData(-1, 150)]     // negative quantity
    [InlineData(10, -150)]    // negative price
    public void ThrowWhenHoldingHasNegativeQuantityOrPrice(decimal quantity, decimal price)
    {
        var targets = new[] { new TargetAllocation("AAPL", 100m) };
        var holdings = new[] { new Holding("AAPL", quantity, price) };

        var exception = Assert.Throws<ArgumentException>(
            () => PortfolioRebalancer.Rebalance(targets, holdings));

        Assert.Contains("negative", exception.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public void ThrowWhenTargetAssetMissingFromHoldings()
    {
        var targets = new[]
        {
            new TargetAllocation("AAPL", 50m),
            new TargetAllocation("TSLA", 50m)
        };
        var holdings = new[] { new Holding("AAPL", 10, 150m) };

        var exception = Assert.Throws<ArgumentException>(
            () => PortfolioRebalancer.Rebalance(targets, holdings));

        Assert.Contains("TSLA", exception.Message);
    }

    // --- Rebalance behaviors ---

    [Fact]
    public void ReturnNoTradesWhenPortfolioIsAlreadyBalanced()
    {
        var targets = new[]
        {
            new TargetAllocation("AAPL", 60m),
            new TargetAllocation("GOOGL", 40m)
        };
        // Total = 600 + 400 = 1000. AAPL target = 600 (60%), GOOGL target = 400 (40%). Already balanced.
        var holdings = new[]
        {
            new Holding("AAPL", 4, 150m),    // 600
            new Holding("GOOGL", 4, 100m)     // 400
        };

        var trades = PortfolioRebalancer.Rebalance(targets, holdings);

        Assert.Empty(trades);
    }

    [Fact]
    public void GenerateBuyAndSellTradesForSimpleTwoAssetRebalance()
    {
        var targets = new[]
        {
            new TargetAllocation("AAPL", 50m),
            new TargetAllocation("GOOGL", 50m)
        };
        // Total = 1500 + 1000 = 2500. Each should be 1250.
        // AAPL: current 1500, target 1250 -> sell 250/150 = 1.6667 shares
        // GOOGL: current 1000, target 1250 -> buy 250/100 = 2.5 shares
        var holdings = new[]
        {
            new Holding("AAPL", 10, 150m),    // 1500
            new Holding("GOOGL", 10, 100m)    // 1000
        };

        var trades = PortfolioRebalancer.Rebalance(targets, holdings);

        Assert.Equal(2, trades.Count);

        var aaplTrade = trades.Single(t => t.Name == "AAPL");
        Assert.Equal(TradeAction.Sell, aaplTrade.Action);
        Assert.Equal(1.6667m, Math.Round(aaplTrade.Quantity, 4));

        var googlTrade = trades.Single(t => t.Name == "GOOGL");
        Assert.Equal(TradeAction.Buy, googlTrade.Action);
        Assert.Equal(2.5m, Math.Round(googlTrade.Quantity, 4));
    }

    [Fact]
    public void SellEntirePositionWhenAssetNotInTargetAllocation()
    {
        var targets = new[] { new TargetAllocation("AAPL", 100m) };
        // Total = 1500 + 1000 = 2500. AAPL target = 2500.
        // AAPL: current 1500, target 2500 -> buy 1000/150 = 6.6667 shares
        // GOOGL: not in target -> sell all 10 shares
        var holdings = new[]
        {
            new Holding("AAPL", 10, 150m),    // 1500
            new Holding("GOOGL", 10, 100m)    // 1000
        };

        var trades = PortfolioRebalancer.Rebalance(targets, holdings);

        var googlTrade = trades.Single(t => t.Name == "GOOGL");
        Assert.Equal(TradeAction.Sell, googlTrade.Action);
        Assert.Equal(10m, googlTrade.Quantity);

        var aaplTrade = trades.Single(t => t.Name == "AAPL");
        Assert.Equal(TradeAction.Buy, aaplTrade.Action);
        Assert.Equal(6.6667m, Math.Round(aaplTrade.Quantity, 4));
    }

    [Fact]
    public void BuyWhenTargetAssetHasZeroQuantityHolding()
    {
        var targets = new[]
        {
            new TargetAllocation("AAPL", 50m),
            new TargetAllocation("TSLA", 50m)
        };
        // Total = 1500 + 0 = 1500. Each should be 750.
        // AAPL: current 1500, target 750 -> sell 750/150 = 5 shares
        // TSLA: current 0, target 750 -> buy 750/200 = 3.75 shares
        var holdings = new[]
        {
            new Holding("AAPL", 10, 150m),    // 1500
            new Holding("TSLA", 0, 200m)       // 0
        };

        var trades = PortfolioRebalancer.Rebalance(targets, holdings);

        Assert.Equal(2, trades.Count);

        var tslaTrade = trades.Single(t => t.Name == "TSLA");
        Assert.Equal(TradeAction.Buy, tslaTrade.Action);
        Assert.Equal(3.75m, tslaTrade.Quantity);

        var aaplTrade = trades.Single(t => t.Name == "AAPL");
        Assert.Equal(TradeAction.Sell, aaplTrade.Action);
        Assert.Equal(5m, aaplTrade.Quantity);
    }

    [Fact]
    public void ReturnNoTradesForSingleAssetAt100Percent()
    {
        var targets = new[] { new TargetAllocation("AAPL", 100m) };
        var holdings = new[] { new Holding("AAPL", 10, 150m) };

        var trades = PortfolioRebalancer.Rebalance(targets, holdings);

        Assert.Empty(trades);
    }

    [Fact]
    public void HandleMultipleAssetsWithVaryingDrift()
    {
        var targets = new[]
        {
            new TargetAllocation("AAPL", 40m),
            new TargetAllocation("GOOGL", 30m),
            new TargetAllocation("MSFT", 30m)
        };
        // Total = 2000 + 1500 + 500 = 4000
        // AAPL target: 1600, current: 2000 -> sell 400/100 = 4
        // GOOGL target: 1200, current: 1500 -> sell 300/150 = 2
        // MSFT target: 1200, current: 500 -> buy 700/50 = 14
        var holdings = new[]
        {
            new Holding("AAPL", 20, 100m),    // 2000
            new Holding("GOOGL", 10, 150m),   // 1500
            new Holding("MSFT", 10, 50m)      // 500
        };

        var trades = PortfolioRebalancer.Rebalance(targets, holdings);

        Assert.Equal(3, trades.Count);

        var aaplTrade = trades.Single(t => t.Name == "AAPL");
        Assert.Equal(TradeAction.Sell, aaplTrade.Action);
        Assert.Equal(4m, aaplTrade.Quantity);

        var googlTrade = trades.Single(t => t.Name == "GOOGL");
        Assert.Equal(TradeAction.Sell, googlTrade.Action);
        Assert.Equal(2m, googlTrade.Quantity);

        var msftTrade = trades.Single(t => t.Name == "MSFT");
        Assert.Equal(TradeAction.Buy, msftTrade.Action);
        Assert.Equal(14m, msftTrade.Quantity);
    }
}
