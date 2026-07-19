import disclaimersJson from "../content/disclaimers.json";
import dimensionsJson from "../content/dimensions.json";
import featuredTypesJson from "../content/featured-types.json";
import questionsJson from "../content/questions.draft.json";
import resultTypesJson from "../content/result-types.json";
import siteCopyJson from "../content/site-copy.json";
import temptationLevelsJson from "../content/temptation-levels.json";
import { disclaimersDocumentSchema, dimensionsDocumentSchema, featuredTypesDocumentSchema, questionsDocumentSchema, resultTypesDocumentSchema, siteCopyDocumentSchema, temptationLevelsDocumentSchema } from "./schemas";

export const disclaimersContent = disclaimersDocumentSchema.parse(disclaimersJson);
export const dimensionsContent = dimensionsDocumentSchema.parse(dimensionsJson);
export const featuredTypesContent = featuredTypesDocumentSchema.parse(featuredTypesJson);
export const questionsContent = questionsDocumentSchema.parse(questionsJson);
export const resultTypesContent = resultTypesDocumentSchema.parse(resultTypesJson);
export const siteCopyContent = siteCopyDocumentSchema.parse(siteCopyJson);
export const temptationLevelsContent = temptationLevelsDocumentSchema.parse(temptationLevelsJson);

export const resultTypeByCode = new Map(resultTypesContent.types.map((item) => [item.code, item]));
export const temptationLevelByNumber = new Map(temptationLevelsContent.levels.map((item) => [item.level, item]));
