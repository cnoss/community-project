gsap.registerPlugin(SplitText);
gsap.registerPlugin(ScrollTrigger);

/* Main
############################################################################ */

document.fonts.ready.then(() => {
  const layout = document.querySelector("[data-layout=home]");
  if (!layout) return;
  layout.querySelectorAll("h1, h2, h3").forEach(el => {
    SplitText.create(el, {
      type: "chars, words, lines",

      mask: "lines",
      autoSplit: true,
      onSplit(self) {
        return gsap.from(self.chars, {
          duration: 0.5 + Math.random() * 0.5,
          yPercent: "random([-100, 100])",
          /*rotation: "random([-90, 90])", */
          ease: "back.out(1.7)",
          autoAlpha: 0,
          scrollTrigger: {
            trigger: el,
            start: "top 80%",
            toggleActions: "play reverse restart reverse",
          },
          stagger: {
            amount: 0.3,
            duration: 0.5 + Math.random() * 0.5,
            from: "center",
          }
        });
      }
    });
  })
});

gsap.utils.toArray(".content img").forEach(image => {
  ScrollTrigger.create({
    trigger: image,
    start: "top 80%",
    onEnter: () => {
      gsap.fromTo(image, { opacity: 0, scale: 1.1 }, { opacity: 1, scale: 1, duration: 1, ease: "power2.out" });
    },
    onEnterBack: () => {
      gsap.fromTo(image, { opacity: 0, scale: 1.1 }, { opacity: 1, scale: 1, duration: 1, ease: "power2.out" });
    },
    onLeave: () => gsap.set(image, { opacity: 0, scale: 1.1 }),
    onLeaveBack: () => gsap.set(image, { opacity: 0, scale: 1.1 })
  });
});