/// <reference path="./index.d.ts" />
import enhanceRay from "./ray";
import enhanceMesh from "./mesh";
import enhanceBoundingBox from "./boundingBox";
import enhanceTexture from "./texture";
import enhanceStandardMaterial from "./standardMaterial";

export default function enhancePlayCanvas() {
    enhanceRay();
    enhanceMesh();
    enhanceBoundingBox();
    enhanceTexture();
    enhanceStandardMaterial();
}
