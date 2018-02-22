import enhanceEvents from "./events";
import enhanceProcedural from "./procedural";
import enhanceRay from "./ray";
import enhanceMesh from "./mesh";
import enhanceBoundingBox from "./boundingBox";
import enhanceTexture from "./texture";
import enhanceStandardMaterial from "./standardMaterial";

export default function enhancePlayCanvas() {
    enhanceEvents();
    enhanceProcedural();
    enhanceRay();
    enhanceMesh();
    enhanceBoundingBox();
    enhanceTexture();
    enhanceStandardMaterial();
}
