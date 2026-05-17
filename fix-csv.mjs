// fix-csv.mjs - 修复 Data Safety CSV
import { readFileSync, writeFileSync } from 'fs';

const csv = readFileSync('store-assets/data_safety_sample.csv', 'utf8');
let lines = csv.split('\n');

// Thoth 实际收集的数据类型
const collectedTypes = new Set([
  'PSL_NAME',
  'PSL_EMAIL', 
  'PSL_APPROX_LOCATION',
  'PSL_AUDIO',
  'PSL_USER_GENERATED_CONTENT'
]);

// 遍历所有行，修复缺失的 EPHEMERAL 回复
let fixedCount = 0;
let removedCount = 0;

const cleanedLines = lines.map((line, index) => {
  if (!line.trim()) return line;
  
  const cols = line.split(',');
  if (cols.length < 5) return line;
  
  const questionId = cols[0];
  
  // 检查是否是 EPHEMERAL 问题且缺少回复
  if (questionId.includes('PSL_DATA_USAGE_RESPONSES:') && questionId.includes(':PSL_DATA_USAGE_EPHEMERAL')) {
    // 提取数据类型
    const match = questionId.match(/^PSL_DATA_USAGE_RESPONSES:(PSL_[^:]+):/);
    if (match) {
      const dataType = match[1];
      
      // 如果数据类型不在收集列表中，删除此行
      if (!collectedTypes.has(dataType)) {
        removedCount++;
        return null; // 标记删除
      }
      
      // 如果在收集列表中，但缺少回复，添加 false
      if (cols[2] === '' && cols[1] === '') {
        cols[2] = 'false';
        fixedCount++;
        return cols.join(',');
      }
    }
  }
  
  return line;
}).filter(line => line !== null); // 删除标记的行

writeFileSync('store-assets/data_safety_sample.csv', cleanedLines.join('\n'), 'utf8');

console.log(`✅ 修复完成！`);
console.log(`   - 修复了 ${fixedCount} 行 EPHEMERAL 回复`);
console.log(`   - 删除了 ${removedCount} 行未收集数据类型的追问`);
console.log(`   - 原始行数: ${lines.length}`);
console.log(`   - 清理后行数: ${cleanedLines.length}`);
