/* readaifirst.com redesign mockup: behaviour (vanilla, no build).
   <a4-strip>, mobile nav, newsletter + mock form states, filters.
   Ported from mockup/system/components.js; the plexus lattice is retired. */
(() => {
  /* ------------------------------------------------------------ A4 strip */
  const STAGES = [
    { key: "assess", label: "Assess", stage: "Stage 1" },
    { key: "architect", label: "Architect", stage: "Stage 2" },
    { key: "activate", label: "Activate", stage: "Stage 3" },
    { key: "amplify", label: "Amplify", stage: "Stage 4" },
  ];
  class A4Strip extends HTMLElement {
    static get observedAttributes() { return ["current"]; }
    connectedCallback() { if (!this._built) this.build(); this.sync(); }
    attributeChangedCallback() { if (this._built) this.sync(); }
    build() {
      this._built = true;
      const nav = document.createElement("nav");
      nav.setAttribute("aria-label", this.getAttribute("label") || "A4 Framework stages");
      const ol = document.createElement("ol");
      STAGES.forEach((s, i) => {
        const li = document.createElement("li");
        const href = this.getAttribute(`href-${s.key}`);
        const el = document.createElement(href ? "a" : "button");
        if (href) el.href = href; else el.type = "button";
        el.className = "a4s-seg";
        el.dataset.stage = s.key;
        el.innerHTML = `<span class="a4s-bar" aria-hidden="true"></span><span class="a4s-name">${s.label}</span><span class="a4s-num">${s.stage}</span>`;
        el.addEventListener("keydown", (ev) => {
          const step = ev.key === "ArrowRight" ? 1 : ev.key === "ArrowLeft" ? -1 : 0;
          if (!step) return;
          ev.preventDefault();
          this.querySelectorAll(".a4s-seg")[(i + step + 4) % 4].focus();
        });
        li.appendChild(el); ol.appendChild(li);
      });
      nav.appendChild(ol); this.appendChild(nav);
    }
    sync() {
      const cur = this.getAttribute("current");
      this.querySelectorAll(".a4s-seg").forEach((el) => {
        const on = el.dataset.stage === cur;
        el.classList.toggle("is-on", on);
        if (on) el.setAttribute("aria-current", "page"); else el.removeAttribute("aria-current");
      });
    }
  }
  customElements.define("a4-strip", A4Strip);

  /* ------------------------------------------------------------ mobile nav */
  document.addEventListener("click", (ev) => {
    const btn = ev.target.closest("[data-nav-toggle]");
    if (!btn) return;
    const header = btn.closest(".site-header");
    const open = btn.getAttribute("aria-expanded") !== "true";
    btn.setAttribute("aria-expanded", String(open));
    btn.setAttribute("aria-label", open ? "Close" : "Menu");
    header.classList.toggle("is-open", open);
  });
  document.addEventListener("keydown", (ev) => {
    if (ev.key !== "Escape") return;
    document.querySelectorAll(".site-header.is-open [data-nav-toggle]").forEach((b) => { b.click(); b.focus(); });
  });

  /* ------------------------------------------------------------ newsletter forms (UI only) */
  document.addEventListener("submit", (ev) => {
    const form = ev.target.closest("form[data-newsletter]");
    if (form) {
      ev.preventDefault();
      const input = form.querySelector("input[type=email]");
      const field = input.closest(".field");
      const msg = form.querySelector(".field-msg");
      const btn = form.querySelector("button[type=submit]");
      const ok = input.value.trim() && input.checkValidity();
      field.classList.toggle("is-error", !ok);
      input.setAttribute("aria-invalid", String(!ok));
      if (!ok) { msg.textContent = "Enter a work email address, for example name@company.com."; input.focus(); return; }
      btn.classList.add("is-loading"); btn.disabled = true;
      setTimeout(() => {
        btn.classList.remove("is-loading"); btn.disabled = false;
        form.classList.add("is-done");
        msg.textContent = form.dataset.success || "";
      }, 700);
      return;
    }
    const mock = ev.target.closest("form[data-mock]");
    if (mock) {
      ev.preventDefault();
      const note = mock.querySelector(".form-note.mock");
      if (note) { note.hidden = false; note.textContent = "Mockup form: nothing was sent."; }
    }
  });

  /* ------------------------------------------------------------ pending-items toggle (mockup badge) */
  const phBtn = document.querySelector("[data-ph-toggle]");
  if (phBtn) {
    const n = phBtn.dataset.n, root = document.documentElement;
    const sync = () => {
      const on = root.classList.contains("show-ph");
      phBtn.setAttribute("aria-pressed", String(on));
      phBtn.textContent = on ? "Hide pending items" : `Show ${n} pending item${n === "1" ? "" : "s"}`;
    };
    sync();
    phBtn.addEventListener("click", () => {
      root.classList.toggle("show-ph");
      try { sessionStorage.setItem("ph", root.classList.contains("show-ph") ? "1" : "0"); } catch (e) {}
      sync();
    });
  }

  /* ------------------------------------------------------------ filters */
  document.querySelectorAll("[data-filter-group]").forEach((group) => {
    const target = document.querySelector(group.dataset.filterGroup);
    if (!target) return;
    const mode = group.dataset.mode || "items";
    group.addEventListener("click", (ev) => {
      const b = ev.target.closest("button[data-f]");
      if (!b) return;
      group.querySelectorAll("button[data-f]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      const f = b.dataset.f;
      target.querySelectorAll(mode === "groups" ? "[data-group]" : "[data-cat]").forEach((el) => {
        const key = mode === "groups" ? el.dataset.group : el.dataset.cat;
        el.hidden = !(f === "all" || key === f || el.dataset.always === "1");
      });
    });
  });
})();
