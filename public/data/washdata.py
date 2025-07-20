import json

# 1. 加载数据
with open('population.json', 'r', encoding='utf-8') as f:
    pop_data = json.load(f)

with open('area.json', 'r', encoding='utf-8') as f:
    area_data = json.load(f)

# 2. 构建面积映射
area_map = {}
for item in area_data:
    name = item.get('name', {}).get('common')
    area = item.get('area')
    if name and isinstance(area, (int, float)):
        area_map[name] = area

# 3. 合并数据，并统计缺失
total_countries = 0
missing_countries = 0
merged = []

for item in pop_data:
    country = item.get('country')
    population = item.get('population')
    area = area_map.get(country)
    total_countries += 1
    if area and population:
        # 单位变换：人口（万人），密度（万人/km²）
        population_wan = population / 10000
        density = population_wan / area  # 万人/km²
        merged.append({
            'country': country,
            'population_wan': round(population_wan, 2),
            'area': round(area, 2),
            'density_wan_per_km2': round(density, 6)
        })
    else:
        missing_countries += 1

# 4. 剔除缺失值比例超过 5% 的城市（国家）
missing_ratio = missing_countries / total_countries
if missing_ratio > 0.05:
    print(f"缺失比例 {missing_ratio:.2%} > 5%，已过滤缺失国家。")
else:
    print(f"缺失比例为 {missing_ratio:.2%}，无需过滤。")

# 5. 保存结果
with open('merged_filtered.json', 'w', encoding='utf-8') as f:
    json.dump(merged, f, ensure_ascii=False, indent=2)

print(f"合并完成，剩余 {len(merged)} 个国家。数据已保存到 merged_filtered.json。")
