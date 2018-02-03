import { createScript, ScriptType } from "./script";

class AnimationController extends ScriptType {
    public static __name = "animationController";

    public initialize() {
        this.lastState = {
            playing: this.entity.animation.playing,
            anim: this.entity.animation.currAnim
        };
    }

    public update() {
        let animation = this.entity.animation;
        let currPlaying = animation.playing;
        let lastPlaying = this.lastState.playing;

        if (lastPlaying === currPlaying) {
            return;
        }

        this.lastState.playing = animation.playing;
        this.lastState.anim = animation.currAnim;

        if (!lastPlaying && currPlaying) {
            animation.fire("start", animation.currAnim);
        } else if (lastPlaying && !currPlaying) {
            animation.fire("end", animation.currAnim);
        }
    }
}

export default createScript(AnimationController);
