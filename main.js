/* Trato Fino, comportamento das páginas */
(function () {
  var WA = "5541998015014";

  // menu do celular
  var navLinks = document.getElementById("navLinks");
  var burger = document.getElementById("burger");
  if (burger) {
    burger.addEventListener("click", function () {
      var aberto = navLinks.classList.toggle("open");
      burger.setAttribute("aria-expanded", aberto ? "true" : "false");
    });
  }

  // marca no menu a página em que a pessoa está
  var atual = location.pathname.split("/").pop() || "index.html";
  Array.prototype.forEach.call(document.querySelectorAll("#navLinks a"), function (a) {
    var alvo = a.getAttribute("href");
    if (alvo === atual || (atual === "index.html" && alvo === "index.html")) a.classList.add("on");
    if (atual.indexOf("blog-") === 0 && alvo === "blog.html") a.classList.add("on");
  });

  // formulários: monta a mensagem e abre o WhatsApp já preenchido
  function enviar(campos, inicio) {
    var partes = [inicio];
    campos.forEach(function (c) {
      var el = document.getElementById(c.id);
      if (el && el.value.trim()) partes.push(c.rotulo + ": " + el.value.trim());
    });
    window.open("https://wa.me/" + WA + "?text=" + encodeURIComponent(partes.join("\n")), "_blank", "noopener");
  }
  var contato = document.getElementById("contactForm");
  if (contato) contato.addEventListener("submit", function (e) {
    e.preventDefault();
    enviar([{id:"cNome",rotulo:"Nome"},{id:"cTel",rotulo:"Telefone"},{id:"cInt",rotulo:"Interesse"},{id:"cMsg",rotulo:"Sobre o pet"}],
           "Oi! Mandei uma mensagem pelo site do Trato Fino.");
  });
  var vaga = document.getElementById("jobForm");
  if (vaga) vaga.addEventListener("submit", function (e) {
    e.preventDefault();
    enviar([{id:"jNome",rotulo:"Nome"},{id:"jTel",rotulo:"Telefone"},{id:"jArea",rotulo:"Área"},{id:"jMsg",rotulo:"Sobre"}],
           "Oi! Vi a página Trabalhe Conosco no site e queria me candidatar.");
  });

  // visor da galeria
  var lb = document.getElementById("lb");
  var tiles = Array.prototype.slice.call(document.querySelectorAll(".gallery button.frame"));
  if (lb && tiles.length) {
    var lbImg = document.getElementById("lbImg"), lbCount = document.getElementById("lbCount");
    var i = 0, veioDe = null;
    function mostrar(n) {
      i = (n + tiles.length) % tiles.length;
      var img = tiles[i].querySelector("img");
      lbImg.src = img.currentSrc || img.src;
      lbImg.alt = img.alt;
      lbCount.textContent = "Foto " + (i + 1) + " de " + tiles.length;
    }
    function abrir(n) {
      veioDe = document.activeElement; mostrar(n);
      lb.classList.add("open"); document.body.style.overflow = "hidden";
      document.getElementById("lbClose").focus();
    }
    function fechar() {
      lb.classList.remove("open"); document.body.style.overflow = ""; lbImg.src = "";
      if (veioDe && veioDe.focus) veioDe.focus();
    }
    tiles.forEach(function (t, n) { t.addEventListener("click", function () { abrir(n); }); });
    document.getElementById("lbClose").addEventListener("click", fechar);
    document.getElementById("lbPrev").addEventListener("click", function () { mostrar(i - 1); });
    document.getElementById("lbNext").addEventListener("click", function () { mostrar(i + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) fechar(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") fechar();
      else if (e.key === "ArrowLeft") mostrar(i - 1);
      else if (e.key === "ArrowRight") mostrar(i + 1);
    });
    var x0 = null;
    lb.addEventListener("touchstart", function (e) { x0 = e.changedTouches[0].clientX; }, {passive:true});
    lb.addEventListener("touchend", function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 45) mostrar(i + (dx < 0 ? 1 : -1));
      x0 = null;
    }, {passive:true});
  }

  // modo revisão: só liga com ?revisao=1 no endereço, para o cliente não ver os avisos
  var ligado = location.search.indexOf("revisao=1") > -1;
  try { if (!ligado && localStorage.getItem("tf-review") === "1" && location.search) ligado = true; } catch (e) {}
  if (ligado) document.body.classList.add("review");
  var botao = document.getElementById("revToggle");
  if (botao) botao.addEventListener("click", function () { document.body.classList.toggle("review"); });
})();
