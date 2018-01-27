/// <reference path="./index.d.ts" />
import enhanceBoundingBox from "./boundingBox";
import enhanceStandardMaterial from "./standardMaterial";

export default function enhancePlayCanvas() {
    enhanceBoundingBox();
    enhanceStandardMaterial();
}

