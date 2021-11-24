import { gsap } from "gsap";
import debug from "@wbe/debug"
const log = debug(`router:transitionsHelper`);

export const transitionsHelper = (el, show: boolean): Promise<any> => {
  return new Promise((resolve) => {
    if (!el) {
      log("el doesnt exist", el);
    }

    gsap.fromTo(
      el,
      { autoAlpha: show ? 0 : 1 },
      {
        duration: 0.5,
        autoAlpha: show ? 1 : 0,
        //delay: 0.1,
        onComplete: resolve,
      }
    );
  });
};
