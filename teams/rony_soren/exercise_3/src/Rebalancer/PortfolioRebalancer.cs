namespace Rebalancer;

public static class PortfolioRebalancer
{
    public static IReadOnlyList<Trade> Rebalance(
        IReadOnlyList<TargetAllocation> targets,
        IReadOnlyList<Holding> holdings)
    {
        PortfolioValidator.ValidateTargetAllocations(targets);
        PortfolioValidator.ValidateHoldings(holdings);
        PortfolioValidator.ValidateTargetAssetsExistInHoldings(targets, holdings);

        var totalValue = holdings.Sum(h => h.Quantity * h.PricePerUnit);

        var holdingsByName = holdings.ToDictionary(h => h.Name);
        var targetNames = targets.Select(t => t.Name).ToHashSet();

        var trades = new List<Trade>();

        foreach (var target in targets)
        {
            var holding = holdingsByName[target.Name];
            var currentValue = holding.Quantity * holding.PricePerUnit;
            var desiredValue = totalValue * (target.Percentage / 100m);
            var difference = desiredValue - currentValue;

            if (difference > 0 && holding.PricePerUnit > 0)
            {
                trades.Add(new Trade(target.Name, TradeAction.Buy, difference / holding.PricePerUnit));
            }
            else if (difference < 0 && holding.PricePerUnit > 0)
            {
                trades.Add(new Trade(target.Name, TradeAction.Sell, Math.Abs(difference) / holding.PricePerUnit));
            }
        }

        foreach (var holding in holdings)
        {
            if (!targetNames.Contains(holding.Name) && holding.Quantity > 0)
            {
                trades.Add(new Trade(holding.Name, TradeAction.Sell, holding.Quantity));
            }
        }

        return trades;
    }
}
