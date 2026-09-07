(function () {
  const requests = [
    {
      id: "list",
      label: "GET /todos",
      run: () => [
        ok("роутер: совпал маршрут todos (GET /todos)"),
        ok("params и payload не объявлены, декодировать нечего"),
        ok("обработчик todos: repository.all"),
        ok("кодирование успеха по Schema.Array(Todo)"),
        done(200, "[{ id, completed, title, createdAt }]"),
      ],
    },
    {
      id: "create-ok",
      label: 'POST /todos  {"title":"  first  "}',
      run: (mode) => mode === "title"
        ? [
          ok("роутер: совпал маршрут create (POST /todos)"),
          fail("payload по схеме Title: пробелы по краям не проходят проверку"),
          skip("обработчик create не вызван"),
          done(400, "{ _tag: \"HttpApiDecodeError\", ... }  — не доменная ошибка"),
        ]
        : [
          ok("роутер: совпал маршрут create (POST /todos)"),
          ok("payload по схеме Struct({ title: String }): строка принята как есть"),
          ok("обработчик create: createTodo(\"  first  \") → validateTitle обрезает пробелы"),
          ok("кодирование успеха по Todo, createdAt → строка ISO"),
          done(200, "{ id, completed: false, title: \"first\", createdAt }"),
        ],
    },
    {
      id: "create-empty",
      label: 'POST /todos  {"title":"   "}',
      run: (mode) => mode === "title"
        ? [
          ok("роутер: совпал маршрут create (POST /todos)"),
          fail("payload по схеме Title: пустая строка не проходит isNonEmpty"),
          skip("обработчик create не вызван, EmptyTitle недостижим"),
          done(400, "{ _tag: \"HttpApiDecodeError\", ... }"),
        ]
        : [
          ok("роутер: совпал маршрут create (POST /todos)"),
          ok("payload по схеме Struct({ title: String }): принято"),
          fail("обработчик create: createTodo → EmptyTitle"),
          ok("EmptyTitle объявлен в error со статусом 400 → кодируется в тело"),
          done(400, "{ _tag: \"EmptyTitle\" }"),
        ],
    },
    {
      id: "toggle-missing",
      label: "PATCH /todos/nope/toggle",
      run: () => [
        ok("роутер: совпал маршрут toggle (PATCH /todos/:id/toggle)"),
        ok("params по { id: TodoId }: строка \"nope\" получает бренд TodoId"),
        fail("обработчик toggle: toggleTodo → TodoNotFound"),
        ok("TodoNotFound объявлен в error со статусом 404"),
        done(404, "{ _tag: \"TodoNotFound\", id: \"nope\" }"),
      ],
    },
    {
      id: "remove-ok",
      label: "DELETE /todos/abc  (todo существует)",
      run: () => [
        ok("роутер: совпал маршрут remove (DELETE /todos/:id)"),
        ok("params по { id: TodoId }"),
        ok("обработчик remove: removeTodo → void"),
        ok("success не объявлен → NoContent"),
        done(204, "пустое тело"),
      ],
    },
    {
      id: "wrong-path",
      label: 'POST /todo  {"title":"x"}',
      run: () => [
        fail("роутер: ни один маршрут не совпал (контракт знает только /todos)"),
        skip("схемы и обработчики не участвуют"),
        done(404, "ответ роутера, не TodoNotFound"),
      ],
    },
    {
      id: "bad-json",
      label: 'POST /todos  {"title": 5}',
      run: () => [
        ok("роутер: совпал маршрут create (POST /todos)"),
        fail("payload: 5 не строка, декодирование не прошло"),
        skip("обработчик create не вызван"),
        done(400, "{ _tag: \"HttpApiDecodeError\", ... }"),
      ],
    },
  ]

  function ok(text) { return { cls: "acquire", text: "✓ " + text } }
  function fail(text) { return { cls: "release", text: "✗ " + text } }
  function skip(text) { return { cls: "keep", text: "– " + text } }
  function done(status, body) { return { cls: status < 400 ? "acquire" : "release", text: `→ ${status}  ${body}` } }

  function mount(root) {
    const select = root.querySelector("[data-request]")
    const modeSelect = root.querySelector("[data-payload-mode]")
    const logEl = root.querySelector("[data-log]")
    requests.forEach((r) => {
      const option = document.createElement("option")
      option.value = r.id
      option.textContent = r.label
      select.appendChild(option)
    })
    function render() {
      const request = requests.find((r) => r.id === select.value)
      logEl.textContent = ""
      request.run(modeSelect.value).forEach((step) => {
        const el = document.createElement("div")
        el.className = step.cls
        el.textContent = step.text
        logEl.appendChild(el)
      })
    }
    select.addEventListener("change", render)
    modeSelect.addEventListener("change", render)
    root.querySelector("[data-send]").addEventListener("click", render)
  }
  document.querySelectorAll("[data-request-sim]").forEach(mount)
})()
