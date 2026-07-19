import { questionsContent, temptationLevelsContent } from "../src/content.js";
import { calculateShadowType, calculateTemptation, DIMENSION_POLES } from "../src/scoring.js";
import { DIMENSION_KEYS, TYPE_CODES } from "../src/types.js";
import type { Answer, DimensionMargins, Question, TemptationSignals, TypeCode } from "../src/types.js";

const signalKeys = ["sycophancyAcceptance","exclusivityAcceptance","memoryAttachment","exitReversal","platformLossReaction"] as const;

interface Variant { scores: number[]; signals: number[]; ties: number[]; gap: number; answers: Answer[] }
interface State { scores: number[]; signals: number[]; ties: number[]; gap: number; count: number }
interface Outcome { primaryType: TypeCode; shadowType: TypeCode; margins: DimensionMargins; level: number; raw: number; normalized: number }

function variants(question: Question): Variant[] {
  const fromAnswers = (answers: Answer[]): Variant => {
    const scores = Array<number>(4).fill(0), signals = Array<number>(5).fill(0), ties=Array<number>(4).fill(0);
    for (const answer of answers) {
      const option = question.options.find((item) => item.id === answer.optionId)!;
      for (const effect of option.dimensionEffects) {
        const dimensionIndex=DIMENSION_KEYS.indexOf(effect.dimension), [first]=DIMENSION_POLES[effect.dimension];
        scores[dimensionIndex]! += effect.pole===first ? effect.points : -effect.points;
      }
      for (const [index,key] of signalKeys.entries()) signals[index]! += option.temptationEffects[key] ?? 0;
    }
    let gap = 0;
    if (question.responseFormat === "COMFORT_RELIABILITY_PAIR") {
      const getPole = (answer: Answer) => question.options.find((item) => item.id === answer.optionId)!.dimensionEffects.find((effect) => effect.dimension === question.primaryDimension)!.pole;
      gap = getPole(answers[0]!) === getPole(answers[1]!) ? 0 : 1;
    }
    const dimensionIndex=DIMENSION_KEYS.indexOf(question.primaryDimension);
    if(terminalIds[question.primaryDimension]===question.id){const [first]=DIMENSION_POLES[question.primaryDimension];const option=question.options.find((item)=>item.id===answers.at(-1)!.optionId)!;const pole=option.dimensionEffects.find((effect)=>effect.dimension===question.primaryDimension)!.pole;ties[dimensionIndex]=pole===first?1:-1;}
    return { scores, signals, ties, gap, answers };
  };
  if (question.responseFormat !== "COMFORT_RELIABILITY_PAIR") return question.options.map((option) => fromAnswers([{ questionId: question.id, optionId: option.id, responseKind: "PRIMARY" }]));
  return question.options.flatMap((comfort) => question.options.map((reliability) => fromAnswers([
    { questionId: question.id, optionId: comfort.id, responseKind: "COMFORT" },
    { questionId: question.id, optionId: reliability.id, responseKind: "RELIABILITY" }
  ])));
}

const terminalIds=Object.fromEntries(DIMENSION_KEYS.map((dimension)=>[dimension,[...questionsContent.questions].reverse().find((question)=>question.primaryDimension===dimension)!.id]));
function stateKey(state: Pick<State,"scores"|"signals"|"ties"|"gap">): string { return [...state.scores,...state.signals,...state.ties,state.gap].join(","); }
function combine(state: State, variant: Variant): State { return { scores: state.scores.map((value,index) => value + variant.scores[index]!), signals: state.signals.map((value,index) => value + variant.signals[index]!), ties:state.ties.map((value,index)=>variant.ties[index]||value), gap: state.gap + variant.gap, count: state.count }; }

function dynamicProgram(excludedId?: string): Map<string,State> {
  const initial={ scores: Array(4).fill(0), signals: Array(5).fill(0), ties:Array(4).fill(0), gap: 0, count: 1 };
  let states = new Map<string,State>([[stateKey(initial),initial]]);
  for (const question of questionsContent.questions) {
    if (question.id === excludedId) continue;
    const next = new Map<string,State>();
    for (const state of states.values()) for (const variant of variants(question)) {
      const combined = combine(state, variant), key = stateKey(combined), existing = next.get(key);
      if (existing) existing.count += state.count; else next.set(key, combined);
    }
    states = next;
  }
  return states;
}

function outcome(state: Pick<State,"scores"|"signals"|"ties"|"gap">): Outcome {
  const margins = {} as DimensionMargins;
  const primaryType = DIMENSION_KEYS.map((dimension,index) => {
    const [first,second] = DIMENSION_POLES[dimension], margin=state.scores[index]!;
    margins[dimension] = margin;
    return margin>0 ? first : margin<0 ? second : (state.ties[index] ?? 0)>=0 ? first : second;
  }).join("") as TypeCode;
  const signals = Object.fromEntries(signalKeys.map((key,index) => [key,state.signals[index]!])) as unknown as TemptationSignals;
  signals.comfortReliabilityGap = state.gap;
  const temptation = calculateTemptation(signals,temptationLevelsContent);
  return { primaryType, shadowType: calculateShadowType(primaryType,margins), margins, level: temptation.level, raw: temptation.rawScore, normalized: temptation.normalizedScore };
}

const states = dynamicProgram();
const total = [...states.values()].reduce((sum,state) => sum + state.count,0);
const typeCounts = Object.fromEntries(TYPE_CODES.map((code) => [code,0]));
const shadowCounts = Object.fromEntries(TYPE_CODES.map((code) => [code,0]));
const levelCounts = Object.fromEntries([0,1,2,3,4,5].map((level) => [level,0]));
const marginCounts = Object.fromEntries(DIMENSION_KEYS.map((dimension) => [dimension,{} as Record<string,number>]));
const poleCounts = { V:0,F:0,O:0,P:0,M:0,N:0,S:0,E:0 };
const levelsByType = Object.fromEntries(TYPE_CODES.map((code)=>[code,new Set<number>()])) as Record<TypeCode,Set<number>>;
let rawMin = Infinity, rawMax = -Infinity;
for (const state of states.values()) {
  const result = outcome(state), count = state.count;
  typeCounts[result.primaryType] = (typeCounts[result.primaryType] ?? 0) + count;
  shadowCounts[result.shadowType] = (shadowCounts[result.shadowType] ?? 0) + count;
  levelCounts[result.level] = (levelCounts[result.level] ?? 0) + count;
  for (const pole of result.primaryType) poleCounts[pole as keyof typeof poleCounts] += count;
  for (const dimension of DIMENSION_KEYS) { const key=String(result.margins[dimension]); const counts=marginCounts[dimension]!; counts[key]=(counts[key]??0)+count; }
  rawMin=Math.min(rawMin,result.raw); rawMax=Math.max(rawMax,result.raw);
  levelsByType[result.primaryType].add(result.level);
}

const variantSets=questionsContent.questions.map(variants);
const impactAcc=questionsContent.questions.map((question)=>({id:question.id,comparisons:0,typeChanges:0,primaryChanges:0,identicalOutcomes:0,maxLevelJump:0}));
const representativePaths: Record<string,Record<string,Answer[]>>={};
let seed=0x220026;
const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/2**32;};
for(let sample=0;sample<200_000;sample++){
  const picked=variantSets.map((set)=>Math.floor(random()*set.length));
  let base:State={scores:Array(4).fill(0),signals:Array(5).fill(0),ties:Array(4).fill(0),gap:0,count:1};
  const selectedAnswers:Answer[]=[];
  for(const [index,set] of variantSets.entries()){const choice=set[picked[index]!]!;base=combine(base,choice);selectedAnswers.push(...choice.answers);}
  const baseResult=outcome(base);
  ((representativePaths[baseResult.primaryType]??={})[String(baseResult.level)]??=selectedAnswers);
  for(const [questionIndex,set] of variantSets.entries()){
    const selected=set[picked[questionIndex]!]!, acc=impactAcc[questionIndex]!;
    for(const alternative of set){if(alternative===selected)continue;
      const changed:State={scores:base.scores.map((value,index)=>value-selected.scores[index]!+alternative.scores[index]!),signals:base.signals.map((value,index)=>value-selected.signals[index]!+alternative.signals[index]!),ties:base.ties.map((value,index)=>alternative.ties[index]||value),gap:base.gap-selected.gap+alternative.gap,count:1};
      const result=outcome(changed);acc.comparisons++;
      if(baseResult.primaryType!==result.primaryType)acc.typeChanges++;
      const dimensionIndex=DIMENSION_KEYS.indexOf(questionsContent.questions[questionIndex]!.primaryDimension);
      if(baseResult.primaryType[dimensionIndex]!==result.primaryType[dimensionIndex])acc.primaryChanges++;
      acc.maxLevelJump=Math.max(acc.maxLevelJump,Math.abs(baseResult.level-result.level));
      if(baseResult.primaryType===result.primaryType&&baseResult.shadowType===result.shadowType&&baseResult.level===result.level&&DIMENSION_KEYS.every((dimension)=>baseResult.margins[dimension]===result.margins[dimension]))acc.identicalOutcomes++;
    }
  }
}
const impacts=impactAcc.map((acc,index)=>({id:acc.id,optionVariants:variantSets[index]!.length,typeChangeRate:acc.typeChanges/acc.comparisons,primaryDimensionChangeRate:acc.primaryChanges/acc.comparisons,identicalOutcomeRate:acc.identicalOutcomes/acc.comparisons,maxLevelJump:acc.maxLevelJump,singleQuestionDominates:acc.primaryChanges===acc.comparisons,method:"fixed-seed 200000 marginal simulation over exact-DP-audited state model"}));

const percent = (count:number) => Math.round(count/total*10000)/100;
console.log(JSON.stringify({
  method:"exact dynamic programming over additive score states",
  totalCombinations:total,
  distinctScoreStates:states.size,
  rawRange:[rawMin,rawMax],
  typeDistribution:Object.fromEntries(Object.entries(typeCounts).map(([key,value])=>[key,{count:value,percent:percent(value)}])),
  levelDistribution:Object.fromEntries(Object.entries(levelCounts).map(([key,value])=>[key,{count:value,percent:percent(value)}])),
  dimensionPoleDistribution:{ VF:{V:percent(poleCounts.V),F:percent(poleCounts.F)}, OP:{O:percent(poleCounts.O),P:percent(poleCounts.P)}, MN:{M:percent(poleCounts.M),N:percent(poleCounts.N)}, SE:{S:percent(poleCounts.S),E:percent(poleCounts.E)} },
  marginDistribution:marginCounts,
  shadowTypeDistribution:Object.fromEntries(Object.entries(shadowCounts).map(([key,value])=>[key,{count:value,percent:percent(value)}])),
  impacts,
  reachableTypes:Object.entries(typeCounts).filter(([,count])=>count>0).map(([code])=>code).sort(),
  levelsByType:Object.fromEntries(TYPE_CODES.map((code)=>[code,[...levelsByType[code]].sort()])),
  representativePaths
},null,2));
