/// <reference path="./index.d.ts" />
import enhanceBoundingBox from "./boundingBox";
import enhanceTexture from "./texture";
import enhanceStandardMaterial from "./standardMaterial";

export default function enhancePlayCanvas() {
    enhanceBoundingBox();
    enhanceTexture();
    enhanceStandardMaterial();
}

