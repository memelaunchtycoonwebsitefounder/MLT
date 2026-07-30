#!/usr/bin/env python3
"""
Generate synthetic historical meme coin cases for the Fate System
Creates 100,000 realistic historical cases based on statistical distributions
"""

import random
import json
from datetime import datetime, timedelta

# Configuration
TOTAL_CASES = 100000
OUTPUT_FILE = "seed_fate_history.sql"

# Categories and their characteristics
CATEGORIES = {
    'animal': {
        'names': ['Dog', 'Cat', 'Pepe', 'Shiba', 'Doge', 'Floki', 'Inu', 'Panda', 'Rabbit', 'Fox'],
        'outcome_weights': [0.15, 0.30, 0.25, 0.30],  # moon, stable, rug, slow_death
        'avg_reputation': 60
    },
    'food': {
        'names': ['Pizza', 'Sushi', 'Burger', 'Taco', 'Ramen', 'Cake', 'Cookie', 'Bacon', 'Cheese', 'Donut'],
        'outcome_weights': [0.10, 0.25, 0.30, 0.35],
        'avg_reputation': 50
    },
    'meme': {
        'names': ['Wojak', 'Chad', 'Soy', 'Gigachad', 'Cope', 'Based', 'Cringe', 'Yeet', 'Vibe', 'Simp'],
        'outcome_weights': [0.20, 0.20, 0.30, 0.30],
        'avg_reputation': 55
    },
    'tech': {
        'names': ['AI', 'Quantum', 'Cyber', 'Meta', 'Web3', 'Blockchain', 'Cloud', 'Digital', 'Crypto', 'Token'],
        'outcome_weights': [0.12, 0.38, 0.20, 0.30],
        'avg_reputation': 65
    },
    'celebrity': {
        'names': ['Elon', 'Trump', 'Biden', 'Kardashian', 'Bezos', 'Zuck', 'Gates', 'Musk', 'Buffett', 'Jobs'],
        'outcome_weights': [0.25, 0.15, 0.35, 0.25],
        'avg_reputation': 45
    },
    'random': {
        'names': ['Moon', 'Rocket', 'Diamond', 'Gold', 'Silver', 'Star', 'Sun', 'Sky', 'Ocean', 'Fire'],
        'outcome_weights': [0.08, 0.22, 0.40, 0.30],
        'avg_reputation': 40
    }
}

OUTCOMES = ['moon', 'stable', 'rug', 'slow_death']
MARKET_TRENDS = ['bull', 'bear', 'sideways']
FINAL_STATUS_MAP = {
    'moon': ['active', 'active', 'active', 'dead'],
    'stable': ['active', 'active', 'active', 'active'],
    'rug': ['scam', 'scam', 'dead'],
    'slow_death': ['dead', 'dead', 'dead', 'active']
}

def generate_coin_name(category):
    """Generate a random coin name"""
    base = random.choice(CATEGORIES[category]['names'])
    suffixes = ['Coin', 'Token', 'Finance', 'Swap', 'DAO', 'Protocol', 'Network', 'Chain', 'Moon', 'Inu']
    return f"{base}{random.choice(suffixes)}"

def generate_symbol(name):
    """Generate a coin symbol"""
    # Take first 3-5 characters
    length = random.randint(3, 5)
    return name[:length].upper()

def calculate_max_price(outcome, initial_price):
    """Calculate max price based on outcome"""
    multipliers = {
        'moon': random.uniform(100, 10000),
        'stable': random.uniform(2, 50),
        'rug': random.uniform(0.1, 5),
        'slow_death': random.uniform(0.5, 3)
    }
    return initial_price * multipliers[outcome]

def calculate_market_cap(max_price, initial_supply):
    """Calculate max market cap"""
    # Add some randomness to make it more realistic
    return max_price * initial_supply * random.uniform(0.6, 1.0)

def generate_case(case_id, category):
    """Generate a single historical case"""
    
    # Basic info
    coin_name = generate_coin_name(category)
    coin_symbol = generate_symbol(coin_name)
    
    # Supply and pricing
    initial_supply = random.randint(1000000, 1000000000)
    initial_price = random.uniform(0.00001, 0.1)
    
    # Creator characteristics
    avg_rep = CATEGORIES[category]['avg_reputation']
    creator_reputation = max(0, min(100, int(random.gauss(avg_rep, 20))))
    creator_previous_coins = random.choices(
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        weights=[0.30, 0.20, 0.15, 0.10, 0.08, 0.07, 0.04, 0.03, 0.02, 0.01, 0.01]
    )[0]
    
    # Market conditions
    market_trend = random.choices(
        MARKET_TRENDS,
        weights=[0.40, 0.25, 0.35]  # Bull markets are more common for new coins
    )[0]
    competition_level = random.randint(1, 10)
    
    # Marketing strategy
    has_website = random.random() < 0.6  # 60% have website
    has_twitter = random.random() < 0.7   # 70% have twitter
    has_telegram = random.random() < 0.5  # 50% have telegram
    marketing_budget = int(random.expovariate(1/5000))  # Exponential distribution
    
    # Community engagement
    initial_holders = random.randint(10, 10000)
    initial_volume = random.uniform(1000, 1000000)
    first_week_growth = random.gauss(50, 200)  # Can be negative
    
    # Outcome (weighted by category)
    outcome = random.choices(
        OUTCOMES,
        weights=CATEGORIES[category]['outcome_weights']
    )[0]
    
    # Adjust outcome based on factors
    quality_score = (
        creator_reputation / 100 * 0.3 +
        (1 if has_website else 0) * 0.2 +
        (1 if has_twitter else 0) * 0.15 +
        (1 if has_telegram else 0) * 0.15 +
        (1 if marketing_budget > 5000 else 0) * 0.2
    )
    
    # Better projects have better outcomes (slight adjustment)
    if quality_score > 0.7 and outcome == 'slow_death' and random.random() < 0.5:
        outcome = 'stable'
    elif quality_score < 0.3 and outcome == 'moon' and random.random() < 0.7:
        outcome = random.choice(['rug', 'slow_death'])
    
    # Calculate outcome metrics
    max_price = calculate_max_price(outcome, initial_price)
    max_market_cap = calculate_market_cap(max_price, initial_supply)
    
    # Days to peak
    days_to_peak_ranges = {
        'moon': (1, 30),
        'stable': (7, 90),
        'rug': (1, 14),
        'slow_death': (3, 60)
    }
    days_to_peak = random.randint(*days_to_peak_ranges[outcome])
    
    # Final status
    final_status = random.choice(FINAL_STATUS_MAP[outcome])
    
    return {
        'coin_name': coin_name,
        'coin_symbol': coin_symbol,
        'initial_supply': initial_supply,
        'initial_price': initial_price,
        'category': category,
        'creator_reputation': creator_reputation,
        'creator_previous_coins': creator_previous_coins,
        'market_trend': market_trend,
        'competition_level': competition_level,
        'has_website': 1 if has_website else 0,
        'has_twitter': 1 if has_twitter else 0,
        'has_telegram': 1 if has_telegram else 0,
        'marketing_budget': marketing_budget,
        'initial_holders': initial_holders,
        'initial_volume': initial_volume,
        'first_week_growth': first_week_growth,
        'outcome': outcome,
        'max_price': max_price,
        'max_market_cap': max_market_cap,
        'days_to_peak': days_to_peak,
        'final_status': final_status
    }

def generate_all_cases():
    """Generate all historical cases"""
    print(f"Generating {TOTAL_CASES} historical cases...")
    
    cases = []
    categories = list(CATEGORIES.keys())
    
    # Distribute cases across categories
    cases_per_category = TOTAL_CASES // len(categories)
    
    for i, category in enumerate(categories):
        start = i * cases_per_category
        end = (i + 1) * cases_per_category if i < len(categories) - 1 else TOTAL_CASES
        
        for case_id in range(start, end):
            case = generate_case(case_id, category)
            cases.append(case)
            
            if (case_id + 1) % 10000 == 0:
                print(f"  Generated {case_id + 1}/{TOTAL_CASES} cases...")
    
    print(f"✓ Generated {len(cases)} cases")
    return cases

def write_sql_file(cases):
    """Write cases to SQL file"""
    print(f"\nWriting to {OUTPUT_FILE}...")
    
    with open(OUTPUT_FILE, 'w') as f:
        f.write("-- Fate System: Historical Cases Data\n")
        f.write(f"-- Generated: {datetime.now().isoformat()}\n")
        f.write(f"-- Total Cases: {len(cases)}\n")
        f.write("-- This file contains synthetic historical meme coin data\n\n")
        
        # Write in batches of 500 to avoid SQL query size limits
        batch_size = 500
        for i in range(0, len(cases), batch_size):
            batch = cases[i:i+batch_size]
            
            f.write(f"\n-- Batch {i//batch_size + 1} ({i+1} to {min(i+batch_size, len(cases))})\n")
            f.write("INSERT INTO coin_history_cases (\n")
            f.write("  coin_name, coin_symbol, initial_supply, initial_price, category,\n")
            f.write("  creator_reputation, creator_previous_coins, market_trend, competition_level,\n")
            f.write("  has_website, has_twitter, has_telegram, marketing_budget,\n")
            f.write("  initial_holders, initial_volume, first_week_growth,\n")
            f.write("  outcome, max_price, max_market_cap, days_to_peak, final_status\n")
            f.write(") VALUES\n")
            
            for j, case in enumerate(batch):
                values = (
                    f"  ('{case['coin_name']}', '{case['coin_symbol']}', "
                    f"{case['initial_supply']}, {case['initial_price']:.8f}, '{case['category']}', "
                    f"{case['creator_reputation']}, {case['creator_previous_coins']}, "
                    f"'{case['market_trend']}', {case['competition_level']}, "
                    f"{case['has_website']}, {case['has_twitter']}, {case['has_telegram']}, "
                    f"{case['marketing_budget']}, "
                    f"{case['initial_holders']}, {case['initial_volume']:.2f}, {case['first_week_growth']:.2f}, "
                    f"'{case['outcome']}', {case['max_price']:.8f}, {case['max_market_cap']:.2f}, "
                    f"{case['days_to_peak']}, '{case['final_status']}')"
                )
                
                if j < len(batch) - 1:
                    f.write(values + ",\n")
                else:
                    f.write(values + ";\n")
    
    print(f"✓ Wrote {OUTPUT_FILE}")
    print(f"  File size: {os.path.getsize(OUTPUT_FILE) / 1024 / 1024:.2f} MB")

def generate_statistics(cases):
    """Generate statistics about the dataset"""
    print("\n" + "="*60)
    print("DATASET STATISTICS")
    print("="*60)
    
    # Outcome distribution
    outcomes = {}
    for case in cases:
        outcome = case['outcome']
        outcomes[outcome] = outcomes.get(outcome, 0) + 1
    
    print("\nOutcome Distribution:")
    for outcome, count in sorted(outcomes.items()):
        percentage = count / len(cases) * 100
        print(f"  {outcome:15s}: {count:6d} ({percentage:5.2f}%)")
    
    # Category distribution
    categories = {}
    for case in cases:
        category = case['category']
        categories[category] = categories.get(category, 0) + 1
    
    print("\nCategory Distribution:")
    for category, count in sorted(categories.items()):
        percentage = count / len(cases) * 100
        print(f"  {category:15s}: {count:6d} ({percentage:5.2f}%)")
    
    # Market trend distribution
    trends = {}
    for case in cases:
        trend = case['market_trend']
        trends[trend] = trends.get(trend, 0) + 1
    
    print("\nMarket Trend Distribution:")
    for trend, count in sorted(trends.items()):
        percentage = count / len(cases) * 100
        print(f"  {trend:15s}: {count:6d} ({percentage:5.2f}%)")
    
    # Price statistics
    prices = [case['max_price'] / case['initial_price'] for case in cases]
    print(f"\nPrice Multiplier Statistics:")
    print(f"  Min:    {min(prices):.2f}x")
    print(f"  Max:    {max(prices):.2f}x")
    print(f"  Mean:   {sum(prices)/len(prices):.2f}x")
    print(f"  Median: {sorted(prices)[len(prices)//2]:.2f}x")
    
    print("\n" + "="*60)

if __name__ == '__main__':
    import os
    
    print("="*60)
    print("FATE SYSTEM: HISTORICAL DATA GENERATOR")
    print("="*60)
    
    # Generate cases
    cases = generate_all_cases()
    
    # Generate statistics
    generate_statistics(cases)
    
    # Write SQL file
    write_sql_file(cases)
    
    print("\n✓ Generation complete!")
    print(f"\nNext steps:")
    print(f"  1. Review the generated data in {OUTPUT_FILE}")
    print(f"  2. Import to D1 database:")
    print(f"     npx wrangler d1 execute webapp-production --local --file={OUTPUT_FILE}")
    print(f"  3. Verify data:")
    print(f"     npx wrangler d1 execute webapp-production --local --command=\"SELECT COUNT(*) FROM coin_history_cases\"")
