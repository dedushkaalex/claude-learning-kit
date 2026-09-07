(function () {
  function mount(root) {
    const strategySelect = root.querySelector("[data-strategy]")
    const leakBox = root.querySelector("[data-leak]")
    const logEl = root.querySelector("[data-log]")
    const subsEl = root.querySelector("[data-subs]")
    const liveEl = root.querySelector("[data-live]")
    const pendingEl = root.querySelector("[data-pending]")

    let subscribers = 0
    let liveHandlers = 0
    let running = false
    let pendingCheck = false
    let mountCount = 0

    function line(text, cls) {
      const el = document.createElement("div")
      el.textContent = text
      if (cls) el.className = cls
      logEl.appendChild(el)
      logEl.scrollTop = logEl.scrollHeight
    }
    function paint() {
      subsEl.textContent = String(subscribers)
      liveEl.textContent = String(liveHandlers)
      pendingEl.textContent = pendingCheck ? "да" : "нет"
    }
    function acquire() {
      mountCount += 1
      running = true
      liveHandlers += 1
      line(`acquire: addEventListener (обработчик #${mountCount}, живых: ${liveHandlers})`, "acquire")
    }
    function release() {
      running = false
      if (leakBox.checked) {
        line("release: тело пустое, обработчик остаётся на window", "release")
      } else {
        liveHandlers -= 1
        line(`release: removeEventListener (живых: ${liveHandlers})`, "release")
      }
    }
    function check() {
      pendingCheck = false
      if (subscribers === 0 && running) {
        line("задача: подписчиков 0, закрываем Scope", "keep")
        release()
      } else {
        line(`задача: подписчиков ${subscribers}, атом остаётся, делать нечего`, "keep")
      }
    }

    function doMount() {
      subscribers += 1
      line(`mount -> подписчиков ${subscribers}`)
      if (!running) acquire()
      paint()
    }
    function doUnmount() {
      if (subscribers === 0) { line("unmount пропущен: подписчиков нет", "keep"); return }
      subscribers -= 1
      line(`unmount -> подписчиков ${subscribers}`)
      if (subscribers === 0) {
        if (strategySelect.value === "immediate") {
          release()
        } else if (!pendingCheck) {
          pendingCheck = true
          line("реестр: запланировать проверку в следующей задаче", "keep")
        }
      }
      paint()
    }
    function doTask() {
      if (!pendingCheck) { line("следующая задача: ничего не запланировано", "keep"); paint(); return }
      check()
      paint()
    }
    function doStrict() {
      line("--- коммит StrictMode: setup, cleanup, setup (синхронно) ---")
      doMount(); doUnmount(); doMount()
    }
    function doStorage() {
      line(`событие storage из другой вкладки -> invalidate("todos") вызван ${liveHandlers} раз(а)`, liveHandlers > 1 ? "release" : "acquire")
    }
    function doReset() {
      subscribers = 0; liveHandlers = 0; running = false; pendingCheck = false; mountCount = 0
      logEl.textContent = ""
      line("сброс")
      paint()
    }

    root.querySelector("[data-mount]").addEventListener("click", doMount)
    root.querySelector("[data-unmount]").addEventListener("click", doUnmount)
    root.querySelector("[data-task]").addEventListener("click", doTask)
    root.querySelector("[data-strict]").addEventListener("click", doStrict)
    root.querySelector("[data-storage]").addEventListener("click", doStorage)
    root.querySelector("[data-reset]").addEventListener("click", doReset)
    paint()
  }
  document.querySelectorAll("[data-lifecycle-sim]").forEach(mount)
})()
