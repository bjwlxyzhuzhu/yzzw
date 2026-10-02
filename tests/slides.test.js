// 课件（PPTX）解析：按页标题识别知识点，封面用作课程名与单元，同栏目练习页并入上一节。
import { test } from 'node:test';
import assert from 'node:assert/strict';
const { analyzeMaterials } = await import('../server/knowledge.js');

const TEXT = ['【第1页】', '第 1 课', '你好', '《HSK标准教程》第1册',
  '【第2页】', '拼音Pinyin', '2. 汉语的声调（四声）Tones(Four Tones)', 'mā', '妈', 'mǎ', '马',
  '【第3页】', '拼音Pinyin', '朗读下列音节，注意声调的不同', 'ā', 'á',
  '【第4页】', '拼音Pinyin', '4. 两个三声音节的连读变调  Tone Sandhi: 3rd tone +3rd tone', 'nǐ （你）', 'hǎo（好）',
  '【第5页】', '生词New Words', '你', '对不起', '没关系',
  '【第6页】', '课文Text 3', 'A：对不起！', 'B：没关系！'].join('\n');

test('课件按页标题识别知识点，不出现“【第N页】”', () => {
  const a = analyzeMaterials([{ filename: 'HSK1-L1.pptx', text: TEXT }]);
  assert.equal(a.course.name, 'HSK标准教程 第1册');
  assert.equal(a.course.unit, '第1课 你好');
  const terms = a.knowledge_points.map((k) => k.term);
  assert.deepEqual(terms.sort(), ['两个三声音节的连读变调', '汉语的声调（四声）', '生词', '课文 3'].sort());
  assert.ok(!terms.some((t) => /第\d+页/.test(t)));
  const tone = a.knowledge_points.find((k) => k.term === '汉语的声调（四声）');
  assert.match(tone.definition, /妈/);
  assert.match(tone.definition, /朗读下列音节/, '同栏目的练习页并入上一节');
});

test('大模型表格输出被截断：保留完整的行，不整段失败', async () => {
  const { parseSectionOutput } = await import('../server/dialogue.js');
  const sec = { kind: 'table', columns: [{ key: 'id' }, { key: 'description' }] };
  const cut = '[\n {"id":"1","description":"能正确朗读四声"},\n {"id":"2","description":"能说“对不起—没关系”"},\n {"id":"3","descr';
  assert.deepEqual(parseSectionOutput(sec, cut).rows.map((r) => r.id), ['1', '2']);
  assert.throws(() => parseSectionOutput(sec, '[ {"id":"1","desc'), (e) => e.code === 'bad_format');
});
