namespace Rebalancer;

public record TargetAllocation(string Name, decimal Percentage);

public record Holding(string Name, decimal Quantity, decimal PricePerUnit);

public record Trade(string Name, TradeAction Action, decimal Quantity);

public enum TradeAction
{
    Buy,
    Sell
}

public static class PortfolioValidator
{
    public static void ValidateTargetAllocations(IReadOnlyList<TargetAllocation> targets)
    {
        if (targets.Count == 0)
            throw new ArgumentException("Target allocations cannot be empty.");

        if (targets.Any(t => t.Percentage < 0))
            throw new ArgumentException("Target allocation percentage cannot be negative.");

        var sum = targets.Sum(t => t.Percentage);
        if (sum != 100m)
            throw new ArgumentException($"Target allocations must sum to 100, but got {sum}.");
    }

    public static void ValidateHoldings(IReadOnlyList<Holding> holdings)
    {
        if (holdings.Any(h => h.Quantity < 0))
            throw new ArgumentException("Holding quantity cannot be negative.");

        if (holdings.Any(h => h.PricePerUnit < 0))
            throw new ArgumentException("Holding price cannot be negative.");
    }

    public static void ValidateTargetAssetsExistInHoldings(
        IReadOnlyList<TargetAllocation> targets,
        IReadOnlyList<Holding> holdings)
    {
        var holdingNames = holdings.Select(h => h.Name).ToHashSet();

        foreach (var target in targets)
        {
            if (!holdingNames.Contains(target.Name))
                throw new ArgumentException(
                    $"Target asset '{target.Name}' is missing from holdings. " +
                    "All target assets must have a corresponding holding (even with 0 quantity) to provide price information.");
        }
    }
}
