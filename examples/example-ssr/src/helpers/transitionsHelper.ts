import { gsap } from "gsap"
import debug from "@cher-ami/debug"
const log = debug(`router:transitionsHelper`)

export const transitionsHelper = (
  el,
  show: boolean,
  from: any = {},
  to: any = {},
): Promise<any> => {
  return new Promise((resolve) => {
    if (!el) {
      log("el doesnt exist", el)
    }

    gsap.fromTo(
      el,
      { autoAlpha: show ? 0 : 1, ...from },

      {
        ...to,
        duration: 0.5,
        autoAlpha: show ? 1 : 0,
        ease: "power1.out",
        onComplete: resolve,
      },
    )
  })
}
