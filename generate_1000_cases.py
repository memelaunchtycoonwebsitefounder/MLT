#!/usr/bin/env python3
"""
Generate 1000 high-quality historical meme coin cases for Fate System
"""
import random

# 定義六大類別及其特性
categories = {
    'animal': {
        'names': ['Doge', 'Shiba', 'Pepe', 'Cat', 'Floki', 'Akita', 'Panda', 'Tiger', 'Wolf', 'Bear'],
        'moon_prob': 0.15
    },
    'food': {
        'names': ['Pizza', 'Sushi', 'Taco', 'Ramen', 'Burger', 'Hotdog', 'Donut', 'Coffee', 'Tea', 'Cake'],
        'moon_prob': 0.10
    },
    'meme': {
        'names': ['Wojak', 'Chad', 'Based', 'Cope', 'Gigachad', 'Sigma', 'Pepe', 'Rare', 'Dank', 'Kek'],
        'moon_prob': 0.20
    },
    'tech': {
        'names': ['AI', 'Quantum', 'Web3', 'Crypto', 'Meta', 'Nano', 'Cyber', 'Digital', 'Smart', 'Chain'],
        'moon_prob': 0.12
    },
    'celebrity': {
        'names': ['Elon', 'Trump', 'Musk', 'Gates', 'Bezos', 'Zuck', 'Jobs', 'Buffett', 'Kanye', 'Drake'],
        'moon_prob': 0.25
    },
    'random': {
        'names': ['Moon', 'Rocket', 'Diamond', 'Gold', 'Star', 'Safe', 'Turbo', 'Ultra', 'Mega', 'Giga'],
        'moon_prob': 0.08
    }
}

suffixes = ['Coin', 'Token', 'Finance', 'Swap', 'Protocol', 'Network', 'Chain', 'DAO', 'Labs', 'Fund']
market_trends = ['bull', 'bear', 'sideways']

def generate_case(case_id):
    """Generate one historical case with realistic distributions"""
    cat = random.choice(list(categories.keys()))
    cat_data = categories[cat]
    
    name = random.choice(cat_data['names']) + random.choice(suffixes)
    symbol = (name[:4] if len(name) >= 4 else name).upper()
    
    supply = random.choice([1000000, 10000000, 100000000, 1000000000])
    price = round(random.uniform(0.0001, 0.01), 6)
    
    rep = random.randint(1, 100)
    prev_coins = random.randint(0, 10)
    trend = random.choice(market_trends)
    competition = random.randint(1, 10)
    
    website = random.choice([0, 1])
    twitter = random.choice([0, 1])
    telegram = random.choice([0, 1])
    
    budget = random.choice([0, 500, 1000, 2000, 5000, 10000, 20000, 50000])
    holders = random.randint(10, 100000)
    volume = random.randint(1000, 10000000)
    
    # 計算質量分數 (0-1)
    quality = (
        rep / 100 * 0.3 +
        (1 if website else 0) * 0.2 +
        (1 if twitter else 0) * 0.15 +
        (1 if telegram else 0) * 0.15 +
        (1 if budget > 5000 else 0) * 0.2
    )
    
    # 根據質量調整結果概率
    rand_val = random.random()
    moon_threshold = cat_data['moon_prob'] * (1 + quality * 0.5)
    stable_threshold = moon_threshold + 0.28
    rug_threshold = stable_threshold + (0.30 - quality * 0.15)
    
    if rand_val < moon_threshold:
        outcome = 'moon'
        max_p = round(price * random.uniform(100, 5000), 6)
        growth = random.uniform(500, 10000)
    elif rand_val < stable_threshold:
        outcome = 'stable'
        max_p = round(price * random.uniform(2, 20), 6)
        growth = random.uniform(10, 200)
    elif rand_val < rug_threshold:
        outcome = 'rug'
        max_p = round(price * random.uniform(1.2, 5), 6)
        growth = random.uniform(-50, 50)
    else:
        outcome = 'slow_death'
        max_p = round(price * random.uniform(0.1, 0.9), 6)
        growth = random.uniform(-90, -10)
    
    days_peak = random.randint(1, 365)
    final_status = 'active' if outcome in ['moon', 'stable'] and random.random() > 0.3 else 'dead'
    
    return (
        name, symbol, supply, price, cat, rep, prev_coins, trend, competition,
        website, twitter, telegram, budget, holders, volume, growth,
        outcome, max_p, supply * max_p, days_peak, final_status
    )

# 生成 1000 條案例
print("-- 1000 High-Quality Historical Cases for Fate System")
print("-- Generated with statistical distributions and quality-based outcomes")
print("-- Categories: animal (15% moon), food (10%), meme (20%), tech (12%), celebrity (25%), random (8%)")
print()

for i in range(1, 1001):
    data = generate_case(i)
    sql = f"INSERT INTO coin_history_cases (coin_name, coin_symbol, initial_supply, initial_price, category, creator_reputation, creator_previous_coins, market_trend, competition_level, has_website, has_twitter, has_telegram, marketing_budget, initial_holders, initial_volume, first_week_growth, outcome, max_price, max_market_cap, days_to_peak, final_status) VALUES ('{data[0]}', '{data[1]}', {data[2]}, {data[3]}, '{data[4]}', {data[5]}, {data[6]}, '{data[7]}', {data[8]}, {data[9]}, {data[10]}, {data[11]}, {data[12]}, {data[13]}, {data[14]}, {data[15]}, '{data[16]}', {data[17]}, {data[18]}, {data[19]}, '{data[20]}');"
    print(sql)

print()
print("-- End of 1000 cases")
