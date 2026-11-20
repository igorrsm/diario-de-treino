/* Guias "Como fazer": boneco em vista lateral, duas posições, animação entre elas, e dicas.
   Ângulos em graus, no sentido da tela: 0 = direita, 90 = baixo, -90 = cima, 180 = esquerda.
   Cada segmento aponta do ponto mais perto do tronco para o mais distante. */
(function () {
  'use strict';
  const L = { tronco: 42, coxa: 31, canela: 30, braco: 23, antebraco: 21, cabeca: 8 };
  const rad = (g) => g * Math.PI / 180;
  const vet = (g, l) => [Math.cos(rad(g)) * l, Math.sin(rad(g)) * l];
  const soma = (p, v) => [p[0] + v[0], p[1] + v[1]];
  const sub = (p, v) => [p[0] - v[0], p[1] - v[1]];

  // Monta as posições das articulações a partir de uma pose.
  function corpo(p) {
    let quadril, joelho, tornozelo;
    if (p.tornozelo) {
      tornozelo = p.tornozelo;
      joelho = sub(tornozelo, vet(p.canela, L.canela));
      quadril = sub(joelho, vet(p.coxa, L.coxa));
    } else {
      quadril = p.quadril;
      joelho = soma(quadril, vet(p.coxa, L.coxa));
      tornozelo = soma(joelho, vet(p.canela, L.canela));
    }
    const pescoco = p.pescoco || soma(quadril, vet(p.tronco, L.tronco));
    const dirTronco = Math.atan2(pescoco[1] - quadril[1], pescoco[0] - quadril[0]) * 180 / Math.PI;
    const ombro = soma(quadril, vet(dirTronco, Math.hypot(pescoco[0] - quadril[0], pescoco[1] - quadril[1]) * 0.92));
    const cabeca = soma(pescoco, vet(p.cabeca == null ? dirTronco : p.cabeca, L.cabeca + 2));
    const cotovelo = soma(ombro, vet(p.braco, L.braco));
    const punho = soma(cotovelo, vet(p.antebraco, L.antebraco));
    const pe = soma(tornozelo, vet(p.pe == null ? 0 : p.pe, 9));
    return { quadril, joelho, tornozelo, pe, pescoco, ombro, cabeca, cotovelo, punho };
  }

  function mistura(a, b, t) {
    const o = {};
    Object.keys(a).forEach((k) => {
      const va = a[k], vb = b[k];
      if (Array.isArray(va)) o[k] = [va[0] + (vb[0] - va[0]) * t, va[1] + (vb[1] - va[1]) * t];
      else if (typeof va === 'number') o[k] = va + (vb - va) * t;
      else o[k] = va;
    });
    return o;
  }

  const linha = (a, b, cls) => '<line class="' + cls + '" x1="' + a[0].toFixed(1) + '" y1="' + a[1].toFixed(1) + '" x2="' + b[0].toFixed(1) + '" y2="' + b[1].toFixed(1) + '"></line>';
  const circulo = (c, r, cls) => '<circle class="' + cls + '" cx="' + c[0].toFixed(1) + '" cy="' + c[1].toFixed(1) + '" r="' + r + '"></circle>';
  const ret = (c, w, h, ang, cls) => '<rect class="' + cls + '" x="' + (-w / 2) + '" y="' + (-h / 2) + '" width="' + w + '" height="' + h + '" rx="2" transform="translate(' + c[0].toFixed(1) + ' ' + c[1].toFixed(1) + ') rotate(' + (ang || 0).toFixed(1) + ')"></rect>';
  const halter = (c) => ret(c, 18, 4, 0, 'eq') + ret(soma(c, [-9, 0]), 4, 11, 0, 'eq-forte') + ret(soma(c, [9, 0]), 4, 11, 0, 'eq-forte');
  const angulo = (a, b) => Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI;

  function desenharCorpo(j) {
    return linha(j.quadril, j.joelho, 'osso') + linha(j.joelho, j.tornozelo, 'osso') + linha(j.tornozelo, j.pe, 'osso') +
      linha(j.quadril, j.pescoco, 'osso tronco') +
      linha(j.ombro, j.cotovelo, 'osso') + linha(j.cotovelo, j.punho, 'osso') +
      circulo(j.cabeca, L.cabeca, 'cabeca') +
      circulo(j.joelho, 2.4, 'junta') + circulo(j.cotovelo, 2.4, 'junta') + circulo(j.quadril, 2.6, 'junta');
  }

  const CHAO = 140;
  const chao = () => linha([4, CHAO], [216, CHAO], 'chao');
  const banco = (x1, x2, y) => ret([(x1 + x2) / 2, y + 3], x2 - x1, 6, 0, 'eq') + linha([x1 + 6, y + 6], [x1 + 6, CHAO], 'eq-fino') + linha([x2 - 6, y + 6], [x2 - 6, CHAO], 'eq-fino');

  const G = {
    'leg-press': {
      a: { quadril: [86, 104], tronco: -150, coxa: -62, canela: 22, braco: 90, antebraco: 30, pe: -45 },
      b: { quadril: [86, 104], tronco: -150, coxa: -28, canela: -42, braco: 90, antebraco: 30, pe: -45 },
      cena: (j) => chao() + linha([20, 124], [92, 112], 'eq') + linha([86, 108], [44, 84], 'eq-largo') +
        linha([100, 128], [196, 32], 'eq-fino') +
        ret(soma(j.tornozelo, vet(-45, 6)), 34, 5, 45, 'eq-forte'),
      dicas: ['Pés na plataforma na largura do quadril, apoio no pé inteiro.',
        'Desça até os joelhos formarem cerca de 90°, sem tirar o quadril do banco.',
        'Empurre sem travar os joelhos lá em cima.'],
      sente: 'coxas e glúteos'
    },
    'supino-maquina': {
      a: { quadril: [92, 108], tronco: -90, coxa: 0, canela: 90, braco: 160, antebraco: -8 },
      b: { quadril: [92, 108], tronco: -90, coxa: 0, canela: 90, braco: 0, antebraco: 0 },
      cena: (j) => chao() + banco(70, 112, 110) + linha([84, 110], [84, 52], 'eq-largo') +
        ret(j.punho, 5, 16, 0, 'eq-forte'),
      dicas: ['Ajuste o banco para os pegadores ficarem no meio do peito.',
        'Costas apoiadas, ombros para trás e para baixo.',
        'Empurre soltando o ar e volte devagar, em 2 a 3 segundos.'],
      sente: 'peito, ombros e tríceps'
    },
    'puxada-frontal': {
      a: { quadril: [92, 112], tronco: -88, coxa: 0, canela: 90, braco: -78, antebraco: -84 },
      b: { quadril: [92, 112], tronco: -98, coxa: 0, canela: 90, braco: 100, antebraco: -82 },
      cena: (j) => chao() + banco(72, 114, 114) + ret([118, 104], 16, 6, 0, 'eq-forte') +
        linha([j.punho[0], j.punho[1]], [j.punho[0], 4], 'cabo') + ret(j.punho, 34, 4, 0, 'eq-forte'),
      dicas: ['Pegue a barra um pouco além da largura dos ombros.',
        'Puxe até a altura do queixo levando os cotovelos para baixo.',
        'Tronco quase reto, sem jogar o corpo para trás.'],
      sente: 'costas e bíceps'
    },
    'cadeira-flexora': {
      a: { quadril: [92, 106], tronco: -95, coxa: 0, canela: 8, braco: 80, antebraco: 10, pe: -80 },
      b: { quadril: [92, 106], tronco: -95, coxa: 0, canela: 118, braco: 80, antebraco: 10, pe: 30 },
      cena: (j) => chao() + banco(70, 126, 110) + linha([76, 110], [74, 54], 'eq-largo') +
        ret(soma(j.joelho, [-8, -8]), 18, 5, 0, 'eq-forte') + circulo(soma(j.tornozelo, [0, 4]), 5, 'eq-forte'),
      dicas: ['Joelho alinhado com o eixo da máquina e almofada logo acima do calcanhar.',
        'Puxe a almofada para baixo e para trás, sem tirar o quadril do banco.',
        'Volte devagar, sem deixar o peso bater.'],
      sente: 'parte de trás da coxa'
    },
    'desenvolvimento-maquina': {
      a: { quadril: [92, 108], tronco: -92, coxa: 0, canela: 90, braco: 40, antebraco: -92 },
      b: { quadril: [92, 108], tronco: -92, coxa: 0, canela: 90, braco: -82, antebraco: -86 },
      cena: (j) => chao() + banco(70, 112, 110) + linha([84, 110], [84, 50], 'eq-largo') + ret(j.punho, 6, 14, 0, 'eq-forte'),
      dicas: ['Pegadores na altura dos ombros no começo.',
        'Empurre para cima sem arquear a lombar, com as costas no encosto.',
        'Pare antes de travar os cotovelos e desça devagar.'],
      sente: 'ombros e tríceps'
    },
    'prancha': {
      a: { quadril: [122, 116], tronco: 186, coxa: 4, canela: 4, braco: 92, antebraco: 180, pe: 90, cabeca: 180 },
      b: { quadril: [122, 113], tronco: 184, coxa: 6, canela: 4, braco: 92, antebraco: 180, pe: 90, cabeca: 180 },
      cena: () => chao(),
      dicas: ['Cotovelos embaixo dos ombros e corpo em linha reta da cabeça aos pés.',
        'Contraia abdômen e glúteos para o quadril não cair nem subir.',
        'Respire normalmente; pare quando a postura começar a se desfazer.'],
      sente: 'abdômen'
    },
    'agachamento-goblet': {
      a: { tornozelo: [104, 134], canela: 90, coxa: 90, tronco: -90, braco: 80, antebraco: -60, pe: 0 },
      b: { tornozelo: [104, 134], canela: 116, coxa: 8, tronco: -58, braco: 60, antebraco: -55, pe: 0 },
      cena: (j) => chao() + ret(soma(j.punho, [3, 0]), 7, 18, 0, 'eq-forte'),
      dicas: ['Segure o halter junto ao peito, pés um pouco além da largura do quadril.',
        'Desça levando o quadril para trás e para baixo, joelhos na direção dos pés.',
        'Calcanhares no chão e peito aberto; suba empurrando o chão.'],
      sente: 'coxas e glúteos'
    },
    'remada-sentada': {
      a: { quadril: [70, 120], tronco: -82, coxa: -8, canela: 10, braco: 4, antebraco: 0, pe: -80 },
      b: { quadril: [70, 120], tronco: -94, coxa: -8, canela: 10, braco: 150, antebraco: 6, pe: -80 },
      cena: (j) => chao() + banco(40, 92, 122) + ret([138, 112], 6, 34, 0, 'eq-forte') +
        linha(j.punho, [210, j.punho[1]], 'cabo') + ret(j.punho, 5, 14, 0, 'eq-forte'),
      dicas: ['Pés apoiados, joelhos levemente dobrados e coluna reta.',
        'Puxe o pegador até a barriga levando os cotovelos para trás.',
        'Aperte as escápulas no fim e volte devagar, sem curvar as costas.'],
      sente: 'meio das costas e bíceps'
    },
    'supino-inclinado-halteres': {
      a: { quadril: [118, 114], tronco: -152, coxa: 10, canela: 88, braco: 108, antebraco: -84, cabeca: -152 },
      b: { quadril: [118, 114], tronco: -152, coxa: 10, canela: 88, braco: -62, antebraco: -62, cabeca: -152 },
      cena: (j) => chao() + linha([128, 118], [62, 84], 'eq-largo') + linha([110, 120], [110, CHAO], 'eq-fino') + halter(j.punho),
      dicas: ['Banco inclinado em cerca de 30°, costas e cabeça apoiadas.',
        'Desça os halteres até a altura do peito, cotovelos a uns 45° do corpo.',
        'Empurre para cima aproximando os halteres, sem bater um no outro.'],
      sente: 'parte de cima do peito e ombros'
    },
    'elevacao-pelvica': {
      a: { tornozelo: [138, 136], canela: 70, coxa: -51, pescoco: [62, 132], braco: 6, antebraco: 0, cabeca: 180, pe: 0 },
      b: { tornozelo: [138, 136], canela: 100, coxa: -17, pescoco: [62, 132], braco: 6, antebraco: 0, cabeca: 180, pe: 0 },
      cena: () => chao(),
      dicas: ['Deitado, joelhos dobrados e pés no chão na largura do quadril.',
        'Suba o quadril apertando o glúteo até o corpo ficar reto dos ombros aos joelhos.',
        'Segure 1 segundo em cima. Se sentir na lombar, suba menos.'],
      sente: 'glúteos e parte de trás da coxa'
    },
    'triceps-corda': {
      a: { tornozelo: [100, 134], canela: 88, coxa: 92, tronco: -84, braco: 96, antebraco: -40, pe: 0 },
      b: { tornozelo: [100, 134], canela: 88, coxa: 92, tronco: -84, braco: 96, antebraco: 92, pe: 0 },
      cena: (j) => chao() + linha(j.punho, [126, 6], 'cabo') + circulo([126, 8], 4, 'eq-forte') + circulo(j.punho, 3.5, 'eq-forte'),
      dicas: ['Cotovelos colados ao corpo e parados durante todo o movimento.',
        'Estique os braços até embaixo, abrindo um pouco a corda no fim.',
        'Volte devagar até a altura do peito.'],
      sente: 'parte de trás do braço'
    },
    'rosca-direta': {
      a: { tornozelo: [104, 134], canela: 90, coxa: 90, tronco: -90, braco: 92, antebraco: 88, pe: 0 },
      b: { tornozelo: [104, 134], canela: 90, coxa: 90, tronco: -90, braco: 84, antebraco: -62, pe: 0 },
      cena: (j) => chao() + ret(j.punho, 6, 28, 0, 'eq-forte'),
      dicas: ['Cotovelos colados ao corpo e tronco parado, sem balançar.',
        'Suba a carga dobrando só os cotovelos.',
        'Desça devagar até quase esticar os braços.'],
      sente: 'bíceps'
    },
    'stiff-halteres': {
      a: { tornozelo: [112, 134], canela: 86, coxa: 94, tronco: -90, braco: 90, antebraco: 90, pe: 0 },
      b: { tornozelo: [112, 134], canela: 88, coxa: 70, tronco: -32, braco: 90, antebraco: 90, pe: 0 },
      cena: (j) => chao() + halter(j.punho),
      dicas: ['Joelhos levemente dobrados e coluna reta o tempo todo.',
        'Empurre o quadril para trás e desça só até onde as costas ficam retas.',
        'Halteres perto das pernas; suba contraindo o glúteo.'],
      sente: 'parte de trás da coxa e glúteos'
    }
  };

  function quadro(id, t) {
    const g = G[id];
    const p = mistura(g.a, g.b, t);
    const j = corpo(p);
    return g.cena(j) + desenharCorpo(j);
  }

  const suave = (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  // Ciclo de 4,2 s: parado em A, sobe em 1,2 s, segura, volta mais devagar em 1,6 s.
  function fase(ms) {
    const c = ms % 4200;
    if (c < 600) return 0;
    if (c < 1800) return suave((c - 600) / 1200);
    if (c < 2600) return 1;
    return 1 - suave((c - 2600) / 1600);
  }

  const ativos = new Set();
  let raf = null;
  function laco(agora) {
    ativos.forEach((el) => {
      if (!el.isConnected) { ativos.delete(el); return; }
      if (el.dataset.pausado === '1') return;
      el.innerHTML = quadro(el.dataset.guia, fase(agora));
    });
    raf = ativos.size ? requestAnimationFrame(laco) : null;
  }
  const semMovimento = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  window.Guias = {
    tem: (id) => !!G[id],
    dicas: (id) => (G[id] ? G[id].dicas : []),
    sente: (id) => (G[id] ? G[id].sente : ''),
    svg: (id) => '<svg class="guia-svg" viewBox="0 0 220 150" role="img" aria-label="Animação do movimento"><g data-guia="' + id + '">' + quadro(id, 0) + '</g></svg>',
    quadro: quadro,
    animar: function (raiz) {
      (raiz || document).querySelectorAll('g[data-guia]').forEach((el) => {
        if (semMovimento()) { el.dataset.pausado = '1'; return; }
        ativos.add(el);
      });
      if (ativos.size && !raf) raf = requestAnimationFrame(laco);
    },
    pausar: function (el, sim) {
      el.dataset.pausado = sim ? '1' : '0';
      if (!sim) { ativos.add(el); if (!raf) raf = requestAnimationFrame(laco); }
    },
    ids: Object.keys(G)
  };
})();
