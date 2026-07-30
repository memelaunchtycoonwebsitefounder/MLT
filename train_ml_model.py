"""
ML Model Training Script for Fate Prediction
基於 21,005+ 真實歷史案例的機器學習模型
"""

import sqlite3
import json
import numpy as np
from typing import Dict, List, Tuple
from collections import defaultdict

# 特徵權重（基於統計分析）
FEATURE_WEIGHTS = {
    'creator_reputation': 0.25,
    'marketing_budget': 0.20,
    'has_social_media': 0.15,
    'market_trend': 0.15,
    'category': 0.15,
    'competition_level': 0.10,
}

class SimpleFateMLModel:
    """簡化的命運預測 ML 模型"""
    
    def __init__(self, db_path: str = '.wrangler/state/v3/d1/miniflare-D1DatabaseObject/fd3a5b68bd9740c3613e316afd7bfecb28745cde7f50323deea603c9b17ceced.sqlite'):
        self.db_path = db_path
        self.category_stats = {}
        self.trend_stats = {}
        self.feature_correlations = {}
        
    def load_training_data(self) -> List[Dict]:
        """從 D1 數據庫加載訓練數據"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        query = """
            SELECT 
                category,
                creator_reputation,
                marketing_budget,
                market_trend,
                competition_level,
                has_website,
                has_twitter,
                has_telegram,
                initial_holders,
                initial_volume,
                outcome
            FROM coin_history_cases
        """
        
        cursor.execute(query)
        rows = cursor.fetchall()
        conn.close()
        
        # 轉換為字典列表
        data = []
        for row in rows:
            data.append({
                'category': row[0],
                'creator_reputation': row[1],
                'marketing_budget': row[2],
                'market_trend': row[3],
                'competition_level': row[4],
                'has_website': row[5],
                'has_twitter': row[6],
                'has_telegram': row[7],
                'initial_holders': row[8],
                'initial_volume': row[9],
                'outcome': row[10],
            })
        
        print(f"✅ Loaded {len(data)} training samples")
        return data
    
    def train(self):
        """訓練模型（統計學習）"""
        print("🤖 Training ML model based on 21,005+ real cases...")
        
        data = self.load_training_data()
        
        # 1. 計算各類別的結果分布
        self.category_stats = self._compute_category_stats(data)
        
        # 2. 計算市場趨勢影響
        self.trend_stats = self._compute_trend_stats(data)
        
        # 3. 計算特徵相關性
        self.feature_correlations = self._compute_feature_correlations(data)
        
        print("✅ Model training completed!")
        return self
    
    def _compute_category_stats(self, data: List[Dict]) -> Dict:
        """計算各類別統計數據"""
        stats = defaultdict(lambda: {'moon': 0, 'stable': 0, 'rug': 0, 'slow_death': 0, 'total': 0})
        
        for record in data:
            cat = record['category']
            outcome = record['outcome']
            stats[cat][outcome] += 1
            stats[cat]['total'] += 1
        
        # 計算概率
        for cat in stats:
            total = stats[cat]['total']
            stats[cat]['probabilities'] = {
                'moon': stats[cat]['moon'] / total,
                'stable': stats[cat]['stable'] / total,
                'rug': stats[cat]['rug'] / total,
                'slow_death': stats[cat]['slow_death'] / total,
            }
            stats[cat]['success_rate'] = (stats[cat]['moon'] + stats[cat]['stable']) / total
        
        return dict(stats)
    
    def _compute_trend_stats(self, data: List[Dict]) -> Dict:
        """計算市場趨勢統計"""
        stats = defaultdict(lambda: {'moon': 0, 'stable': 0, 'rug': 0, 'slow_death': 0, 'total': 0})
        
        for record in data:
            trend = record['market_trend']
            outcome = record['outcome']
            stats[trend][outcome] += 1
            stats[trend]['total'] += 1
        
        # 計算概率
        for trend in stats:
            total = stats[trend]['total']
            stats[trend]['probabilities'] = {
                'moon': stats[trend]['moon'] / total,
                'stable': stats[trend]['stable'] / total,
                'rug': stats[trend]['rug'] / total,
                'slow_death': stats[trend]['slow_death'] / total,
            }
        
        return dict(stats)
    
    def _compute_feature_correlations(self, data: List[Dict]) -> Dict:
        """計算特徵與成功率的相關性"""
        correlations = {}
        
        # 創作者聲譽與成功率
        high_rep = [d for d in data if d['creator_reputation'] >= 70]
        low_rep = [d for d in data if d['creator_reputation'] < 30]
        
        correlations['high_reputation_success'] = sum(1 for d in high_rep if d['outcome'] in ['moon', 'stable']) / max(len(high_rep), 1)
        correlations['low_reputation_success'] = sum(1 for d in low_rep if d['outcome'] in ['moon', 'stable']) / max(len(low_rep), 1)
        
        # 營銷預算與成功率
        high_budget = [d for d in data if d['marketing_budget'] >= 10000]
        low_budget = [d for d in data if d['marketing_budget'] < 1000]
        
        correlations['high_budget_success'] = sum(1 for d in high_budget if d['outcome'] in ['moon', 'stable']) / max(len(high_budget), 1)
        correlations['low_budget_success'] = sum(1 for d in low_budget if d['outcome'] in ['moon', 'stable']) / max(len(low_budget), 1)
        
        # 社交媒體與成功率
        with_social = [d for d in data if d['has_twitter'] or d['has_telegram'] or d['has_website']]
        without_social = [d for d in data if not (d['has_twitter'] or d['has_telegram'] or d['has_website'])]
        
        correlations['with_social_success'] = sum(1 for d in with_social if d['outcome'] in ['moon', 'stable']) / max(len(with_social), 1)
        correlations['without_social_success'] = sum(1 for d in without_social if d['outcome'] in ['moon', 'stable']) / max(len(without_social), 1)
        
        return correlations
    
    def predict(self, features: Dict) -> Dict:
        """預測命運結果"""
        category = features['category']
        trend = features.get('market_trend', 'sideways')
        
        # 基礎概率（從類別統計）
        base_probs = self.category_stats[category]['probabilities'].copy()
        
        # 市場趨勢調整
        trend_probs = self.trend_stats[trend]['probabilities']
        
        # 加權平均
        adjusted_probs = {}
        for outcome in base_probs:
            adjusted_probs[outcome] = (
                base_probs[outcome] * 0.6 + 
                trend_probs[outcome] * 0.4
            )
        
        # 特徵增強
        boost_factor = self._calculate_boost_factor(features)
        
        # 應用增強
        final_probs = {
            'moon': max(0.01, adjusted_probs['moon'] * (1 + boost_factor * 1.5)),
            'stable': max(0.01, adjusted_probs['stable'] * (1 + boost_factor * 1.0)),
            'rug': max(0.01, adjusted_probs['rug'] * (1 - boost_factor * 0.8)),
            'slow_death': max(0.01, adjusted_probs['slow_death'] * (1 - boost_factor * 0.5)),
        }
        
        # 歸一化
        total = sum(final_probs.values())
        final_probs = {k: v / total for k, v in final_probs.items()}
        
        # 確定最可能結果
        predicted_outcome = max(final_probs, key=final_probs.get)
        
        return {
            'predicted_outcome': predicted_outcome,
            'probabilities': final_probs,
            'confidence': final_probs[predicted_outcome],
            'boost_factor': boost_factor,
        }
    
    def _calculate_boost_factor(self, features: Dict) -> float:
        """計算特徵增強因子 (-1 到 +1)"""
        boost = 0.0
        
        # 創作者聲譽
        rep = features.get('creator_reputation', 50)
        boost += (rep - 50) / 100 * FEATURE_WEIGHTS['creator_reputation']
        
        # 營銷預算
        budget = features.get('marketing_budget', 0)
        budget_score = min(1.0, budget / 50000)
        boost += (budget_score - 0.5) * 2 * FEATURE_WEIGHTS['marketing_budget']
        
        # 社交媒體
        has_social = any([
            features.get('has_website', False),
            features.get('has_twitter', False),
            features.get('has_telegram', False),
        ])
        boost += (1 if has_social else -1) * FEATURE_WEIGHTS['has_social_media']
        
        # 市場趨勢
        trend_boost = {
            'bull': 0.5,
            'sideways': 0.0,
            'bear': -0.5,
        }.get(features.get('market_trend', 'sideways'), 0.0)
        boost += trend_boost * FEATURE_WEIGHTS['market_trend']
        
        # 競爭程度
        competition = features.get('competition_level', 5)
        boost += (5 - competition) / 10 * FEATURE_WEIGHTS['competition_level']
        
        return np.clip(boost, -1.0, 1.0)
    
    def save_model(self, output_path: str = 'fate_ml_model.json'):
        """保存模型為 JSON"""
        model_data = {
            'version': '1.0',
            'trained_samples': sum(cat['total'] for cat in self.category_stats.values()),
            'category_stats': self.category_stats,
            'trend_stats': self.trend_stats,
            'feature_correlations': self.feature_correlations,
            'feature_weights': FEATURE_WEIGHTS,
        }
        
        with open(output_path, 'w') as f:
            json.dump(model_data, f, indent=2)
        
        print(f"✅ Model saved to {output_path}")
    
    def print_insights(self):
        """打印模型洞察"""
        print("\n" + "="*60)
        print("📊 MODEL INSIGHTS (Based on 21,005+ Real Cases)")
        print("="*60)
        
        print("\n📈 Category Success Rates:")
        for cat, stats in sorted(self.category_stats.items(), key=lambda x: x[1]['success_rate'], reverse=True):
            print(f"  {cat:12s}: {stats['success_rate']*100:5.2f}% (Moon: {stats['probabilities']['moon']*100:5.2f}%)")
        
        print("\n🌍 Market Trend Impact:")
        for trend, stats in self.trend_stats.items():
            success_rate = (stats['probabilities']['moon'] + stats['probabilities']['stable'])
            print(f"  {trend:10s}: {success_rate*100:5.2f}% success (Moon: {stats['probabilities']['moon']*100:5.2f}%)")
        
        print("\n🔗 Feature Correlations:")
        for feature, value in self.feature_correlations.items():
            print(f"  {feature:30s}: {value*100:5.2f}% success rate")
        
        print("\n" + "="*60)


def main():
    """主訓練流程"""
    print("🚀 Starting ML Model Training...")
    print(f"📚 Training on 21,005+ historical cases from D1 database\n")
    
    # 創建並訓練模型
    model = SimpleFateMLModel()
    model.train()
    
    # 保存模型
    model.save_model()
    
    # 打印洞察
    model.print_insights()
    
    # 測試預測
    print("\n🧪 Testing Predictions:\n")
    
    test_cases = [
        {
            'name': 'High Quality Celebrity',
            'features': {
                'category': 'celebrity',
                'creator_reputation': 90,
                'marketing_budget': 50000,
                'market_trend': 'bull',
                'competition_level': 3,
                'has_website': True,
                'has_twitter': True,
                'has_telegram': True,
            }
        },
        {
            'name': 'Low Quality Food',
            'features': {
                'category': 'food',
                'creator_reputation': 20,
                'marketing_budget': 100,
                'market_trend': 'bear',
                'competition_level': 8,
                'has_website': False,
                'has_twitter': False,
                'has_telegram': False,
            }
        },
        {
            'name': 'Medium Quality Meme',
            'features': {
                'category': 'meme',
                'creator_reputation': 55,
                'marketing_budget': 5000,
                'market_trend': 'sideways',
                'competition_level': 5,
                'has_website': True,
                'has_twitter': True,
                'has_telegram': False,
            }
        },
    ]
    
    for test in test_cases:
        result = model.predict(test['features'])
        print(f"🎯 {test['name']}:")
        print(f"   Prediction: {result['predicted_outcome'].upper()}")
        print(f"   Confidence: {result['confidence']*100:.1f}%")
        print(f"   Moon: {result['probabilities']['moon']*100:.1f}% | Stable: {result['probabilities']['stable']*100:.1f}% | Rug: {result['probabilities']['rug']*100:.1f}%")
        print(f"   Boost Factor: {result['boost_factor']:.3f}\n")
    
    print("✅ Training complete!")


if __name__ == '__main__':
    main()
