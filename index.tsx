import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  FileText,
  ClipboardList,
  Calendar,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { feriadosISO, prorrogsISO, stjRates, stfRates, funjusRates, ValorData } from './triario-data';

// Placeholder for missing logo
const simbaLogo = "https://placehold.co/400x400?text=Simba-JUD";

type YesNo = 'sim' | 'não' | '';
type TipoRecurso = 'Especial' | 'Extraordinário' | '';
type Multa = 'não' | 'sim, recolhida' | 'sim, não recolhida' | '';
type Gratuidade =
  | 'não invocada'
  | 'já é ou afirma ser beneficiário'
  | 'requer no recurso em análise'
  | 'é o próprio objeto do recurso'
  | 'presumida (defensor público, dativo ou NPJ)'
  | '';
type Subscritor =
  | 'advogado particular'
  | 'procurador público'
  | 'procurador nomeado'
  | 'advogado em causa própria'
  | '';
type Contrarrazoes = 'apresentadas' | 'ausente alguma' | 'ausentes' | '';
type MPTeor = 'mera ciência' | 'pela admissão' | 'pela inadmissão' | 'ausência de interesse' | '';

type TriagemState = {
  tipo: TipoRecurso;
  acordo: YesNo;
  valido: YesNo;
  desist: YesNo;
  valida: YesNo;
  sigla: string;
  interp: string;
  decrec: 'colegiada/acórdão' | 'monocrática/singular' | '';
  camara: string;
  emaberto: YesNo;
  envio: string;
  consulta: YesNo;
  leitura: string;
  emdobro: 'simples' | 'em dobro' | '';
  multa: Multa;
  motivo: 'Fazenda Pública ou justiça gratuita' | 'é o próprio objeto do recurso' | 'não identificado' | '';
  dispensa: YesNo;
  gratuidade: Gratuidade;
  deferida: YesNo;
  movdef: string;
  requerida: YesNo;
  movped: string;
  atoincomp: YesNo;
  comprova:
    | 'no prazo para interposição do recurso'
    | 'no dia útil seguinte ao término do prazo'
    | 'posteriormente'
    | 'ausente'
    | '';
  apos16: YesNo;
  guiast: string;
  compst: string;
  valorst: string;
  guiavinc: YesNo;
  guia: YesNo;
  guiamov: string;
  guiorig: YesNo;
  comp: YesNo;
  compmov: string;
  comptipo: 'de pagamento' | 'de agendamento' | '';
  codbar: 'confere' | 'diverge ou guia ausente' | '';
  valorfj: string;
  sisuni: 'regular' | 'irregular' | '';
  parcial: YesNo;
  subscritor: Subscritor;
  nomemovi: string;
  movis: string;
  cadeia: YesNo;
  faltante: 'ao próprio subscritor' | 'a outro elo da cadeia' | '';
  suspefeito: 'não requerido' | 'requerido no corpo do recurso' | 'requerido em petição apartada' | '';
  autuado: YesNo;
  exclusivi: 'requerida' | 'não requerida' | '';
  cadastrada: YesNo;
  regular: YesNo;
  contrarra: Contrarrazoes;
  contramovis: string;
  intimado: YesNo;
  intimovi: string;
  crraberto: YesNo;
  decursocrr: YesNo;
  semadv: YesNo;
  emepe: YesNo;
  mani: YesNo;
  teormani: MPTeor;
  manimovis: string;
  decursomp: YesNo;
  remetido: YesNo;
};

const initialState: TriagemState = {
  tipo: '',
  acordo: '',
  valido: '',
  desist: '',
  valida: '',
  sigla: '',
  interp: '',
  decrec: '',
  camara: '',
  emaberto: '',
  envio: '',
  consulta: '',
  leitura: '',
  emdobro: '',
  multa: '',
  motivo: '',
  dispensa: '',
  gratuidade: '',
  deferida: '',
  movdef: '',
  requerida: '',
  movped: '',
  atoincomp: '',
  comprova: '',
  apos16: '',
  guiast: '',
  compst: '',
  valorst: '',
  guiavinc: '',
  guia: '',
  guiamov: '',
  guiorig: '',
  comp: '',
  compmov: '',
  comptipo: '',
  codbar: '',
  valorfj: '',
  sisuni: '',
  parcial: '',
  subscritor: '',
  nomemovi: '',
  movis: '',
  cadeia: '',
  faltante: '',
  suspefeito: '',
  autuado: '',
  exclusivi: '',
  cadastrada: '',
  regular: '',
  contrarra: '',
  contramovis: '',
  intimado: '',
  intimovi: '',
  crraberto: '',
  decursocrr: '',
  semadv: '',
  emepe: '',
  mani: '',
  teormani: '',
  manimovis: '',
  decursomp: '',
  remetido: '',
};

type Tempestividade = {
  status: 'tempestivo' | 'intempestivo' | 'pendente';
  intim?: Date;
  comeco?: Date;
  venc?: Date;
  prazo?: number;
  mensagem?: string;
};

const toDate = (value: string) => new Date(`${value}T00:00:00`);
const feriados: Date[] = feriadosISO.map(toDate);
const prorrogs: Date[] = prorrogsISO.map(toDate);

const toBusinessDate = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const isHoliday = (date: Date) => feriados.some((d) => isSameDay(d, date));
const isProrrogacao = (date: Date) => prorrogs.some((d) => isSameDay(d, date));

const isBusinessDay = (date: Date) => {
  const day = date.getDay();
  if (day === 0 || day === 6) return false;
  return !isHoliday(date);
};

const nextBusinessDay = (date: Date) => {
  let current = toBusinessDate(date);
  while (!isBusinessDay(current)) {
    current = addDays(current, 1);
  }
  return current;
};

const pickRate = (interp: Date | null, rates: ValorData[]) => {
  if (!interp) return 0;
  const sorted = [...rates].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  let value = 0;
  sorted.forEach((rate) => {
    if (interp >= toDate(rate.start)) {
      value = rate.value;
    }
  });
  return value;
};

const formatDate = (date?: Date) => {
  if (!date) return '—';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
};

const parseInputDate = (value: string) => {
  if (!value) return null;
  return new Date(`${value}T00:00:00`);
};

const computeTempestividade = (state: TriagemState): Tempestividade => {
  const envio = parseInputDate(state.envio);
  const interp = parseInputDate(state.interp);
  if (!envio || !interp) {
    return { status: 'pendente', mensagem: 'Preencha envio da intimação e interposição.' };
  }
  const prazo = state.emdobro === 'em dobro' ? 30 : 15;
  const leitura = state.consulta === 'sim' ? parseInputDate(state.leitura) : null;
  const auto = addDays(envio, 10);
  const intimBase = leitura && leitura <= auto ? leitura : auto;
  const intim = nextBusinessDay(intimBase);
  let comeco = addDays(intim, 1);
  while (!isBusinessDay(comeco) || isProrrogacao(comeco)) {
    comeco = addDays(comeco, 1);
  }
  let venc = comeco;
  const contagem: Date[] = [venc];
  while (contagem.length < prazo) {
    venc = addDays(venc, 1);
    while (!isBusinessDay(venc)) {
      venc = addDays(venc, 1);
    }
    contagem.push(venc);
  }
  while (isProrrogacao(venc) || !isBusinessDay(venc)) {
    venc = addDays(venc, 1);
  }
  const status = interp <= venc ? 'tempestivo' : 'intempestivo';
  return { status, intim, comeco, venc, prazo };
};

type Outputs = {
  tempest: Tempestividade;
  deverST: number;
  deverFJ: number;
  controut: string;
  mpout: string;
  grout: string;
  funjout: string;
  procurout: string;
  exclusout: string;
  suspefout: string;
  observacoes: string[];
};

const buildResumoText = (state: TriagemState, outputs: Outputs) => {
  const safe = (v: string) => (v ? v : '—');
  const lines: string[] = [
    'Resumo - Portal de Triagem',
    `Data: ${new Date().toLocaleString('pt-BR')}`,
    `Sigla: ${safe(state.sigla)}`,
    '',
    `Tipo: ${safe(state.tipo)}`,
    `Interposição: ${safe(state.interp)}`,
    `Decisão recorrida: ${safe(state.decrec)}`,
    `Câmara: ${safe(state.camara)}`,
    '',
    `Tempestivo: ${outputs.tempest.status}`,
    `Intimação: ${formatDate(outputs.tempest.intim)}`,
    `Começo do prazo: ${formatDate(outputs.tempest.comeco)}`,
    `Prazo: ${outputs.tempest.prazo || '—'} dias`,
    `Vencimento: ${formatDate(outputs.tempest.venc)}`,
    '',
    `GRU: ${outputs.grout}`,
    `Funjus: ${outputs.funjout}`,
    `Valores devidos - Tribunal Superior: R$ ${outputs.deverST.toFixed(2)} | Funjus: R$ ${outputs.deverFJ.toFixed(2)}`,
    '',
    `Procuração/Nomeação: ${outputs.procurout}`,
    `Exclusividade na intimação: ${outputs.exclusout}`,
    `Efeito suspensivo: ${outputs.suspefout}`,
    '',
    `Contrarrazões: ${outputs.controut}`,
    `Ministério Público: ${outputs.mpout}`,
  ];
  if (outputs.observacoes.length) {
    lines.push('', 'Observações/Minutas:');
    outputs.observacoes.forEach((obs, idx) => lines.push(`${idx + 1}. ${obs}`));
  }
  return lines.join('\n');
};

const computeOutputs = (state: TriagemState): Outputs => {
  const tempest = computeTempestividade(state);
  const interpDate = parseInputDate(state.interp);
  const deverST =
    state.tipo === 'Especial'
      ? pickRate(interpDate, stjRates)
      : state.tipo === 'Extraordinário'
      ? pickRate(interpDate, stfRates)
      : 0;
  const deverFJ = pickRate(interpDate, funjusRates);

  const controut = (() => {
    if (state.contrarra && state.contrarra !== 'ausentes') {
      return state.contramovis ? `mov(s). ${state.contramovis}` : 'apresentadas';
    }
    if (state.intimado === 'sim' && state.crraberto === 'não' && state.decursocrr === 'sim') return 'não';
    if (state.intimado === 'não' && state.semadv === 'sim') return 'sem adv.';
    return 'vide obs.';
  })();

  const mpout = (() => {
    if (state.emepe === 'não') return 'N/A';
    if (state.mani === 'sim') {
      const base = state.teormani || 'mera ciência';
      return state.manimovis ? `${base}; mov. ${state.manimovis}` : base;
    }
    if (state.remetido === 'sim' && state.decursomp === 'sim') return 'deixou de se manifestar';
    return 'vide obs.';
  })();

  const grout = (() => {
    if (state.dispensa === 'sim') {
      return 'dispensado (CPC, art. 1.007, §1º)';
    }
    if (state.gratuidade === 'já é ou afirma ser beneficiário' && state.atoincomp !== 'sim') {
      if (state.deferida === 'sim') return `justiça gratuita mov. ${state.movdef || '?'}`;
      if (state.requerida === 'sim') return `justiça gratuita mov. ${state.movped || '?'}`;
      return 'justiça gratuita requerida no recurso';
    }
    if (state.gratuidade === 'requer no recurso em análise') return 'justiça gratuita requerida no recurso';
    if (state.gratuidade === 'é o próprio objeto do recurso') return 'justiça gratuita é o próprio objeto';
    if (state.gratuidade === 'presumida (defensor público, dativo ou NPJ)')
      return 'justiça gratuita presumida (defensor público, dativo ou NPJ)';
    const guiaInfo = state.guiast ? `guia mov. ${state.guiast}` : 'guia não localizada';
    const compInfo = state.compst ? `comprovante mov. ${state.compst}` : 'comprovante não localizado';
    return `${guiaInfo}; ${compInfo}`;
  })();

  const funjout = (() => {
    if (state.dispensa === 'sim') {
      return 'dispensado (CPC, art. 1.007, §1º)';
    }
    if (state.gratuidade === 'já é ou afirma ser beneficiário' && state.atoincomp !== 'sim') {
      if (state.deferida === 'sim') return `justiça gratuita mov. ${state.movdef || '?'}`;
      if (state.requerida === 'sim') return `justiça gratuita mov. ${state.movped || '?'}`;
      return 'justiça gratuita requerida no recurso';
    }
    if (state.gratuidade === 'requer no recurso em análise') return 'justiça gratuita requerida no recurso';
    if (state.gratuidade === 'é o próprio objeto do recurso') return 'justiça gratuita é o próprio objeto';
    if (state.gratuidade === 'presumida (defensor público, dativo ou NPJ)')
      return 'justiça gratuita presumida (defensor público, dativo ou NPJ)';
    const guiaInfo =
      state.guiavinc === 'sim'
        ? 'guia vinculada'
        : state.guia === 'sim'
        ? `guia mov. ${state.guiamov || '?'}`
        : 'guia não localizada';
    const compInfo =
      state.guiavinc === 'sim'
        ? 'comprovante vinculado'
        : state.comp === 'sim'
        ? `comprovante mov. ${state.compmov || '?'}`
        : 'comprovante não localizado';
    return `${guiaInfo}; ${compInfo}`;
  })();

  const procurout = (() => {
    if (state.subscritor === 'procurador público' || state.subscritor === 'advogado em causa própria') {
      return state.subscritor || 'N/A';
    }
    if (state.subscritor === 'procurador nomeado') {
      return state.nomemovi ? `mov. ${state.nomemovi}` : 'nomeação não localizada';
    }
    if (state.subscritor === 'advogado particular' && state.movis) return `mov(s). ${state.movis}`;
    if (state.subscritor === 'advogado particular') return 'movimentos não informados';
    return 'N/A';
  })();

  const exclusout = (() => {
    if (state.exclusivi === 'não requerida') return 'não requerida';
    if (state.exclusivi === 'requerida' && state.cadastrada === 'sim') return 'requerida e já cadastrada';
    if (state.exclusivi === 'requerida' && state.regular === 'sim') return 'requerida';
    if (state.exclusivi === 'requerida' && state.regular === 'não') return 'requerida, mas sem poderes';
    return 'N/A';
  })();

  const suspefout = (() => {
    if (!state.suspefeito) return 'N/A';
    if (state.suspefeito === 'requerido em petição apartada' && state.autuado === 'sim')
      return 'requerido em petição apartada e autuado';
    return state.suspefeito;
  })();

  const observacoes: string[] = [];
  if (state.emaberto === 'sim') {
    observacoes.push(
      'Há prazo em aberto na Câmara de origem; sugere-se devolver para aguardar decurso.'
    );
  }
  if (state.contrarra !== 'apresentadas' && state.intimado === 'não' && state.semadv === 'não') {
    observacoes.push('Determinar intimação do(s) recorrido(s) para contrarrazões.');
  } else if (state.contrarra !== 'apresentadas' && state.intimado === 'sim' && state.crraberto === 'sim') {
    observacoes.push('Prazo de contrarrazões em aberto; aguardar decurso.');
  } else if (
    state.contrarra !== 'apresentadas' &&
    state.intimado === 'sim' &&
    state.crraberto === 'não' &&
    state.decursocrr === 'não'
  ) {
    observacoes.push('Determinar certificação do decurso do prazo para contrarrazões.');
  }
  if (
    (state.emepe === 'sim' && state.mani === 'sim' && state.teormani === 'mera ciência' && state.decursomp === 'não') ||
    (state.emepe === 'sim' && state.mani === 'não' && state.remetido === 'sim' && state.decursomp === 'não')
  ) {
    observacoes.push('Aguardar decurso do prazo para manifestação da PGJ.');
  } else if (state.emepe === 'sim' && state.mani === 'não' && state.remetido === 'não') {
    observacoes.push('Encaminhar autos à PGJ.');
  }

  const recodobro =
    state.dispensa === 'não' &&
    state.gratuidade === 'não invocada' &&
    (state.comprova === 'ausente' ||
      state.comprova === 'posteriormente' ||
      (state.comprova === 'no dia útil seguinte ao término do prazo' && state.apos16 === 'não'));

  const valorSTNum = Number(state.valorst || 0);
  const valorFJNum = Number(state.valorfj || 0);

  if (recodobro && (deverST || deverFJ)) {
    observacoes.push(
      `Caso de recolhimento em dobro; intimar para regularizar. Valores: Tribunal Superior R$ ${(
        deverST * 2
      ).toFixed(2)}, FUNJUS R$ ${(deverFJ * 2).toFixed(2)}`
    );
  } else if (
    state.dispensa === 'não' &&
    state.gratuidade === 'já é ou afirma ser beneficiário' &&
    state.atoincomp === 'sim'
  ) {
    observacoes.push(
      `Ato incompatível com justiça gratuita; intimar para recolher preparo. Valores: Tribunal Superior R$ ${deverST.toFixed(
        2
      )}, FUNJUS R$ ${deverFJ.toFixed(2)}`
    );
  } else if (
    state.dispensa === 'não' &&
    (state.gratuidade === 'não invocada' || state.atoincomp === 'sim') &&
    (valorSTNum < deverST || valorFJNum < deverFJ)
  ) {
    const parts = [];
    if (valorSTNum < deverST) parts.push(`Tribunal Superior R$ ${(deverST - valorSTNum).toFixed(2)}`);
    if (valorFJNum < deverFJ) parts.push(`Funjus R$ ${(deverFJ - valorFJNum).toFixed(2)}`);
    if (parts.length) {
      observacoes.push(`Complementar preparo: ${parts.join(' | ')}`);
    }
  }

  if (state.subscritor === 'advogado particular' && state.cadeia === 'não') {
    observacoes.push('Regularizar cadeia de procurações para o subscritor.');
  } else if (state.subscritor === 'advogado particular' && state.cadeia === 'sim' && !state.movis) {
    observacoes.push('Informar movimentos completos da cadeia de poderes.');
  }
  if (state.exclusivi === 'requerida' && state.cadastrada === 'não' && state.regular === 'sim') {
    observacoes.push('Deferir pedido de exclusividade e cadastrar procurador nas partes.');
  }
  if (state.suspefeito === 'requerido em petição apartada' && state.autuado === 'não') {
    observacoes.push('Autuar separadamente o pedido de efeito suspensivo.');
  }

  return {
    tempest,
    deverST,
    deverFJ,
    controut,
    mpout,
    grout,
    funjout,
    procurout,
    exclusout,
    suspefout,
    observacoes,
  };
};

type StepId = 'recurso' | 'dados' | 'tempest' | 'preparo' | 'processo' | 'resumo';

const computeStepWarnings = (state: TriagemState, outputs: Outputs): Record<StepId, string[]> => {
  const warnings: Record<StepId, string[]> = {
    recurso: [],
    dados: [],
    tempest: [],
    preparo: [],
    processo: [],
    resumo: [],
  };

  if (!state.tipo) warnings.recurso.push('Selecione o tipo do recurso.');
  if (state.acordo === '') warnings.recurso.push('Informe se houve acordo.');
  if (state.acordo === 'sim' && !state.valido) warnings.recurso.push('Confirme se o acordo é válido.');
  if (state.desist === 'sim' && !state.valida) warnings.recurso.push('Indique se a desistência é válida.');
  if (!state.sigla) warnings.recurso.push('Informe uma sigla para organizar a minuta/post-it.');

  if (!state.interp) warnings.dados.push('Preencha a data de interposição.');
  if (!state.decrec) warnings.dados.push('Selecione a decisão recorrida.');
  if (!state.camara) warnings.dados.push('Indique a câmara/órgão julgador.');
  if (state.emaberto === '') warnings.dados.push('Marque se há prazo em aberto na origem.');

  const envioDate = parseInputDate(state.envio);
  const interpDate = parseInputDate(state.interp);
  if (!state.envio) warnings.tempest.push('Preencha a data de envio/expedição da intimação.');
  if (state.consulta === '') warnings.tempest.push('Informe se houve consulta eletrônica.');
  if (state.consulta === 'sim' && !state.leitura) warnings.tempest.push('Data da leitura pendente.');
  if (!state.emdobro) warnings.tempest.push('Escolha o tipo de prazo (simples ou em dobro).');
  if (interpDate && envioDate && interpDate < envioDate) {
    warnings.tempest.push('Interposição anterior ao envio da intimação; revise as datas.');
  }
  if (outputs.tempest.status === 'pendente') {
    warnings.tempest.push(outputs.tempest.mensagem || 'Complete os campos para calcular a tempestividade.');
  } else if (outputs.tempest.status === 'intempestivo') {
    warnings.tempest.push('Pelo cálculo atual, o recurso está intempestivo.');
  }

  if (state.multa === '') warnings.preparo.push('Informe se há multa por embargos protelatórios.');
  if (state.multa === 'sim, não recolhida' && !state.motivo) {
    warnings.preparo.push('Descreva o motivo da multa não recolhida.');
  }
  if (state.dispensa === '') warnings.preparo.push('Indique se há dispensa de preparo.');
  if (state.gratuidade === '') warnings.preparo.push('Informe a situação da justiça gratuita.');
  if (state.gratuidade === 'já é ou afirma ser beneficiário' && state.deferida === '') {
    warnings.preparo.push('Confirme se a gratuidade foi deferida.');
  }
  if (state.deferida === 'sim' && !state.movdef) warnings.preparo.push('Movimento do deferimento pendente.');
  if (state.deferida === 'não' && state.requerida === 'sim' && !state.movped) {
    warnings.preparo.push('Movimento do pedido de gratuidade pendente.');
  }
  if (state.gratuidade === 'não invocada' && state.comprova === '') {
    warnings.preparo.push('Informe a comprovação do preparo.');
  }
  if (state.comprova === 'no dia útil seguinte ao término do prazo' && state.apos16 === '') {
    warnings.preparo.push('Confirme se o protocolo foi após as 16h.');
  }
  if (state.guiavinc === '') warnings.preparo.push('Indique se a guia Funjus está vinculada no sistema.');
  if (state.guiavinc === 'não' && state.guia === 'sim' && !state.guiamov) {
    warnings.preparo.push('Movimento da guia Funjus pendente.');
  }
  if (state.guiavinc === 'não' && state.comp === 'sim' && !state.compmov) {
    warnings.preparo.push('Movimento do comprovante pendente.');
  }
  if (state.comp === 'sim' && !state.comptipo) warnings.preparo.push('Tipo de comprovante pendente.');
  if (state.comp === 'sim' && !state.codbar) warnings.preparo.push('Conferência do código de barras pendente.');

  if (!state.subscritor) warnings.processo.push('Informe quem subscreve o recurso.');
  if (state.subscritor === 'procurador nomeado' && !state.nomemovi) {
    warnings.processo.push('Movimento de nomeação pendente.');
  }
  if (state.subscritor === 'advogado particular') {
    if (!state.movis) warnings.processo.push('Informe os movimentos da cadeia de poderes.');
    if (state.cadeia === '') warnings.processo.push('Confirme se a cadeia está completa.');
    if (state.cadeia === 'não' && !state.faltante) warnings.processo.push('Aponte onde falta poder.');
  }
  if (state.suspefeito === '') warnings.processo.push('Informe sobre pedido de efeito suspensivo.');
  if (state.suspefeito === 'requerido em petição apartada' && state.autuado === '') {
    warnings.processo.push('Indique se a petição foi autuada.');
  }
  if (state.exclusivi === '') warnings.processo.push('Informe se há pedido de exclusividade na intimação.');
  if (state.exclusivi === 'requerida' && state.cadastrada === '') {
    warnings.processo.push('Diga se o procurador já está cadastrado.');
  }
  if (state.cadastrada === 'não' && state.regular === '') {
    warnings.processo.push('Confirme a regularidade do advogado para exclusividade.');
  }
  if (state.contrarra === '') warnings.processo.push('Situação das contrarrazões pendente.');
  if (state.contrarra !== 'apresentadas' && state.intimado === '') {
    warnings.processo.push('Indique se o recorrido foi intimado.');
  }
  if (state.intimado === 'sim' && state.crraberto === '') {
    warnings.processo.push('Informe se há prazo aberto de contrarrazões.');
  }
  if (state.intimado === 'sim' && state.crraberto === 'não' && state.decursocrr === '') {
    warnings.processo.push('Certificação do decurso das contrarrazões pendente.');
  }
  if (state.intimado === 'não' && state.semadv === '') {
    warnings.processo.push('Indique se o recorrido tem advogado constituído.');
  }
  if (state.emepe === '') warnings.processo.push('Informe se há intervenção do MP.');
  if (state.emepe === 'sim' && state.mani === '') warnings.processo.push('Situação da manifestação do MP pendente.');
  if (state.mani === 'sim' && state.teormani === '') warnings.processo.push('Teor da manifestação do MP pendente.');
  if (state.mani === 'sim' && !state.manimovis) warnings.processo.push('Movimento da manifestação do MP pendente.');
  if (state.mani === 'sim' && state.teormani === 'mera ciência' && state.decursomp === '') {
    warnings.processo.push('Confirme o decurso do prazo do MP.');
  }
  if (state.mani === 'não' && state.remetido === '') warnings.processo.push('Informe se os autos foram remetidos ao MP.');
  if (state.remetido === 'sim' && state.decursomp === '') {
    warnings.processo.push('Decurso do prazo do MP pendente.');
  }

  return warnings;
};

const steps: { id: StepId; label: string; icon: typeof FileText }[] = [
  { id: 'recurso', label: 'Recurso', icon: FileText },
  { id: 'dados', label: 'Dados iniciais', icon: Calendar },
  { id: 'tempest', label: 'Tempestividade', icon: ClipboardList },
  { id: 'preparo', label: 'Preparo e custas', icon: ShieldAlert },
  { id: 'processo', label: 'Representação e pedidos', icon: AlertTriangle },
  { id: 'resumo', label: 'Resumo', icon: CheckCircle2 },
];

const InputLabel = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
    <span>{label}</span>
    {children}
  </label>
);

const SectionCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="relative bg-white/85 backdrop-blur-sm border border-slate-200/80 rounded-2xl p-6 shadow-lg shadow-slate-200/70 overflow-hidden">
    <div className="absolute inset-x-4 top-0 h-[3px] bg-gradient-to-r from-slate-900 via-amber-500 to-emerald-500 opacity-70" />
    <div className="relative space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Ficha</span>
      </div>
      <div className="grid gap-4">{children}</div>
    </div>
  </div>
);

const Pill = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 border border-slate-200 text-slate-700 text-xs font-semibold shadow-sm">
    {children}
  </span>
);

const MetricCard = ({
  label,
  value,
  helper,
  tone = 'neutral',
}: {
  label: string;
  value: string;
  helper?: string;
  tone?: 'neutral' | 'positive' | 'negative';
}) => {
  const tones = {
    neutral: 'border-slate-200 bg-white/85 text-slate-800 shadow-slate-200/70',
    positive: 'border-emerald-200 bg-emerald-50/90 text-emerald-900 shadow-emerald-200/60',
    negative: 'border-amber-200 bg-amber-50/90 text-amber-900 shadow-amber-200/60',
  };
  return (
    <div className={`rounded-2xl border px-4 py-3 shadow-lg ${tones[tone]}`}>
      <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-slate-500">{label}</p>
      <p className="text-lg font-semibold leading-tight mt-1">{value}</p>
      {helper && <p className="text-xs mt-1 text-slate-600">{helper}</p>}
    </div>
  );
};

const App = () => {
  const STORAGE_KEY = 'triario_state_v1';

  const loadState = (): TriagemState => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return initialState;
      const parsed = JSON.parse(raw) as Partial<TriagemState>;
      return { ...initialState, ...parsed };
    } catch {
      return initialState;
    }
  };

  const [state, setState] = useState<TriagemState>(() => loadState());
  const [step, setStep] = useState(0);
  const [copied, setCopied] = useState(false);

  const outputs = useMemo(() => computeOutputs(state), [state]);
  const summaryText = useMemo(() => buildResumoText(state, outputs), [state, outputs]);
  const stepWarnings = useMemo(() => computeStepWarnings(state, outputs), [state, outputs]);

  const handleChange = <K extends keyof TriagemState>(key: K, value: TriagemState[K]) => {
    setState((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state]);

  const downloadResumo = () => {
    const blob = new Blob([summaryText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resumo-triagem-${state.sigla || 'triario'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyResumo = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(summaryText);
      } else {
        const ta = document.createElement('textarea');
        ta.value = summaryText;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const next = () => setStep((s) => Math.min(steps.length - 1, s + 1));
  const prev = () => setStep((s) => Math.max(0, s - 1));
  const restart = () => {
    setState(initialState);
    setStep(0);
  };
  const clearStorage = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setState(initialState);
    setStep(0);
  };

  const renderStep = () => {
    const warningsForStep = stepWarnings[steps[step].id] || [];
    const content = (() => {
      switch (steps[step].id) {
        case 'recurso':
          return (
            <div className="grid lg:grid-cols-2 gap-4">
              <SectionCard title="Triar um novo recurso">
                <div className="grid md:grid-cols-2 gap-4">
                  <InputLabel label="Tipo">
                    <select
                      className="input"
                      value={state.tipo}
                      onChange={(e) => handleChange('tipo', e.target.value as TipoRecurso)}
                    >
                      <option value="">Selecione</option>
                      <option value="Especial">Especial</option>
                      <option value="Extraordinário">Extraordinário</option>
                    </select>
                  </InputLabel>
                  <InputLabel label="Sigla para minutas">
                    <input
                      className="input"
                      placeholder="AR-99"
                      value={state.sigla}
                      onChange={(e) => handleChange('sigla', e.target.value)}
                    />
                  </InputLabel>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <InputLabel label="Acordo">
                    <select
                      className="input"
                      value={state.acordo}
                      onChange={(e) => handleChange('acordo', e.target.value as YesNo)}
                    >
                      <option value="">Selecione</option>
                      <option value="sim">Sim</option>
                      <option value="não">Não</option>
                    </select>
                  </InputLabel>
                  {state.acordo === 'sim' && (
                    <InputLabel label="Acordo válido?">
                      <select
                        className="input"
                        value={state.valido}
                        onChange={(e) => handleChange('valido', e.target.value as YesNo)}
                      >
                        <option value="">Selecione</option>
                        <option value="sim">Sim</option>
                        <option value="não">Não</option>
                      </select>
                    </InputLabel>
                  )}
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <InputLabel label="Desistência">
                    <select
                      className="input"
                      value={state.desist}
                      onChange={(e) => handleChange('desist', e.target.value as YesNo)}
                    >
                      <option value="">Selecione</option>
                      <option value="sim">Sim</option>
                      <option value="não">Não</option>
                    </select>
                  </InputLabel>
                  {state.desist === 'sim' && (
                    <InputLabel label="Desistência válida?">
                      <select
                        className="input"
                        value={state.valida}
                        onChange={(e) => handleChange('valida', e.target.value as YesNo)}
                      >
                        <option value="">Selecione</option>
                        <option value="sim">Sim</option>
                        <option value="não">Não</option>
                      </select>
                    </InputLabel>
                  )}
                </div>
              </SectionCard>
              <SectionCard title="Ajuda rápida">
                <ul className="space-y-2 text-sm text-slate-600">
                  <li>
                    <Pill>Importante</Pill> Confirme a validade de acordos e desistências antes de prosseguir.
                  </li>
                  <li>
                    <Pill>Tipificação</Pill> “Especial” aplica tabela STJ; “Extraordinário” aplica tabela STF.
                  </li>
                  <li>
                    <Pill>Sigla</Pill> Use o padrão interno (ex.: AR-130E+T) para a minuta/post-it.
                  </li>
                </ul>
              </SectionCard>
            </div>
          );
        case 'dados':
          return (
            <div className="grid lg:grid-cols-2 gap-4">
              <SectionCard title="Dados iniciais">
                <div className="grid md:grid-cols-2 gap-4">
                  <InputLabel label="Interposição (data)">
                    <input
                      type="date"
                      className="input"
                      value={state.interp}
                      onChange={(e) => handleChange('interp', e.target.value)}
                    />
                  </InputLabel>
                  <InputLabel label="Decisão recorrida">
                    <select
                      className="input"
                      value={state.decrec}
                      onChange={(e) =>
                        handleChange('decrec', e.target.value as TriagemState['decrec'])
                      }
                    >
                      <option value="">Selecione</option>
                      <option value="colegiada/acórdão">colegiada/acórdão</option>
                      <option value="monocrática/singular">Monocrática/singular</option>
                    </select>
                  </InputLabel>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <InputLabel label="Câmara">
                    <input
                      className="input"
                      placeholder="Ex.: 7ª Câmara Cível"
                      value={state.camara}
                      onChange={(e) => handleChange('camara', e.target.value)}
                    />
                  </InputLabel>
                  <InputLabel label="Prazo em aberto na origem?">
                    <select
                      className="input"
                      value={state.emaberto}
                      onChange={(e) => handleChange('emaberto', e.target.value as YesNo)}
                    >
                      <option value="">Selecione</option>
                      <option value="sim">Sim</option>
                      <option value="não">Não</option>
                    </select>
                  </InputLabel>
                </div>
              </SectionCard>
              <SectionCard title="Checklist rápido">
                <ul className="space-y-2 text-sm text-slate-600">
                  <li>• Use a data do protocolo efetivo para “Interposição”.</li>
                  <li>• Se a decisão for monocrática, o fluxo pode parar por incabimento.</li>
                  <li>• “Prazo em aberto” ignora contrarrazões (serão tratadas depois).</li>
                </ul>
              </SectionCard>
            </div>
          );
        case 'tempest':
          return (
            <div className="grid lg:grid-cols-2 gap-4">
              <SectionCard title="Tempestividade">
                <div className="grid md:grid-cols-2 gap-4">
                  <InputLabel label="Envio (expedição) da intimação">
                    <input
                      type="date"
                      className="input"
                      value={state.envio}
                      onChange={(e) => handleChange('envio', e.target.value)}
                    />
                  </InputLabel>
                  <InputLabel label="Consulta eletrônica (leitura)">
                    <select
                      className="input"
                      value={state.consulta}
                      onChange={(e) => handleChange('consulta', e.target.value as YesNo)}
                    >
                      <option value="">Selecione</option>
                      <option value="sim">Sim</option>
                      <option value="não">Não</option>
                    </select>
                  </InputLabel>
                  {state.consulta === 'sim' && (
                    <InputLabel label="Data da leitura">
                      <input
                        type="date"
                        className="input"
                        value={state.leitura}
                        onChange={(e) => handleChange('leitura', e.target.value)}
                      />
                    </InputLabel>
                  )}
                  <InputLabel label="Prazo">
                    <select
                      className="input"
                      value={state.emdobro}
                      onChange={(e) => handleChange('emdobro', e.target.value as TriagemState['emdobro'])}
                    >
                      <option value="">Selecione</option>
                      <option value="simples">Simples (15 dias)</option>
                      <option value="em dobro">Em dobro (30 dias)</option>
                    </select>
                  </InputLabel>
                </div>
                <div className="mt-4 bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <p className="text-sm text-slate-600 mb-2">Resultado parcial</p>
                  {outputs.tempest.status === 'pendente' ? (
                    <div className="text-sm text-slate-500">{outputs.tempest.mensagem}</div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-2 text-sm text-slate-800">
                      <div>
                        <strong>Intimação:</strong> {formatDate(outputs.tempest.intim)}
                      </div>
                      <div>
                        <strong>Começo do prazo:</strong> {formatDate(outputs.tempest.comeco)}
                      </div>
                      <div>
                        <strong>Prazo:</strong> {outputs.tempest.prazo} dias
                      </div>
                      <div>
                        <strong>Vencimento:</strong> {formatDate(outputs.tempest.venc)}
                      </div>
                      <div className="col-span-full flex items-center gap-2 text-sm">
                        {outputs.tempest.status === 'tempestivo' ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                        )}
                        <span className="font-semibold uppercase tracking-tight">
                          {outputs.tempest.status}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </SectionCard>
              <SectionCard title="Critérios usados">
                <ul className="space-y-2 text-sm text-slate-600">
                  <li>• Intimação presumida 10 dias após envio, salvo leitura antes disso.</li>
                  <li>• Contagem só em dias úteis (feriados/prorrogações 2020–2025 incluídos).</li>
                  <li>• Vencimento empurrado se recair em suspensão ou fim de semana.</li>
                </ul>
              </SectionCard>
            </div>
          );
        case 'preparo':
          return (
            <div className="grid lg:grid-cols-2 gap-4">
              <SectionCard title="Preparo e custas">
                <div className="grid md:grid-cols-2 gap-4">
                  <InputLabel label="Multa por embargos protelatórios">
                    <select
                      className="input"
                      value={state.multa}
                      onChange={(e) => handleChange('multa', e.target.value as Multa)}
                    >
                      <option value="">Selecione</option>
                      <option value="não">Não</option>
                      <option value="sim, recolhida">Sim, recolhida</option>
                      <option value="sim, não recolhida">Sim, não recolhida</option>
                    </select>
                  </InputLabel>
                  {state.multa === 'sim, não recolhida' && (
                    <InputLabel label="Motivo">
                      <select
                        className="input"
                        value={state.motivo}
                        onChange={(e) =>
                          handleChange('motivo', e.target.value as TriagemState['motivo'])
                        }
                      >
                        <option value="">Selecione</option>
                        <option value="Fazenda Pública ou justiça gratuita">Fazenda Pública ou justiça gratuita</option>
                        <option value="é o próprio objeto do recurso">É o próprio objeto do recurso</option>
                        <option value="não identificado">Não identificado</option>
                      </select>
                    </InputLabel>
                  )}
                  <InputLabel label="Dispensa (MP/ente público/autarquia)">
                    <select
                      className="input"
                      value={state.dispensa}
                      onChange={(e) => handleChange('dispensa', e.target.value as YesNo)}
                    >
                      <option value="">Selecione</option>
                      <option value="sim">Sim</option>
                      <option value="não">Não</option>
                    </select>
                  </InputLabel>
                  <InputLabel label="Justiça gratuita">
                    <select
                      className="input"
                      value={state.gratuidade}
                      onChange={(e) =>
                        handleChange('gratuidade', e.target.value as TriagemState['gratuidade'])
                      }
                    >
                      <option value="">Selecione</option>
                      <option value="não invocada">Não invocada</option>
                      <option value="já é ou afirma ser beneficiário">Já é ou afirma ser beneficiário</option>
                      <option value="requer no recurso em análise">Requer no recurso em análise</option>
                      <option value="é o próprio objeto do recurso">É o próprio objeto do recurso</option>
                      <option value="presumida (defensor público, dativo ou NPJ)">
                        Presumida (defensor público, dativo ou NPJ)
                      </option>
                    </select>
                  </InputLabel>
                  {state.gratuidade === 'já é ou afirma ser beneficiário' && (
                    <>
                      <InputLabel label="Deferida expressamente?">
                        <select
                          className="input"
                          value={state.deferida}
                          onChange={(e) => handleChange('deferida', e.target.value as YesNo)}
                        >
                          <option value="">Selecione</option>
                          <option value="sim">Sim</option>
                          <option value="não">Não</option>
                        </select>
                      </InputLabel>
                      {state.deferida === 'sim' && (
                        <InputLabel label="Movimento (deferimento)">
                          <input
                            className="input"
                            placeholder="Ex.: 9.1"
                            value={state.movdef}
                            onChange={(e) => handleChange('movdef', e.target.value)}
                          />
                        </InputLabel>
                      )}
                      {state.deferida === 'não' && (
                        <>
                          <InputLabel label="Requerida anteriormente?">
                            <select
                              className="input"
                              value={state.requerida}
                              onChange={(e) => handleChange('requerida', e.target.value as YesNo)}
                            >
                              <option value="">Selecione</option>
                              <option value="sim">Sim</option>
                              <option value="não">Não</option>
                            </select>
                          </InputLabel>
                          {state.requerida === 'sim' && (
                            <InputLabel label="Movimento (pedido)">
                              <input
                                className="input"
                                placeholder="Ex.: 9.1"
                                value={state.movped}
                                onChange={(e) => handleChange('movped', e.target.value)}
                              />
                            </InputLabel>
                          )}
                        </>
                      )}
                      <InputLabel label="Ato incompatível (pagamento prévio)?">
                        <select
                          className="input"
                          value={state.atoincomp}
                          onChange={(e) => handleChange('atoincomp', e.target.value as YesNo)}
                        >
                          <option value="">Selecione</option>
                          <option value="sim">Sim</option>
                          <option value="não">Não</option>
                        </select>
                      </InputLabel>
                    </>
                  )}
                  {state.gratuidade === 'não invocada' && (
                    <>
                      <InputLabel label="Comprovação de preparo">
                        <select
                          className="input"
                          value={state.comprova}
                          onChange={(e) =>
                            handleChange('comprova', e.target.value as TriagemState['comprova'])
                          }
                        >
                          <option value="">Selecione</option>
                          <option value="no prazo para interposição do recurso">
                            No prazo para interposição do recurso
                          </option>
                          <option value="no dia útil seguinte ao término do prazo">
                            No dia útil seguinte ao término do prazo
                          </option>
                          <option value="posteriormente">Posteriormente</option>
                          <option value="ausente">Ausente</option>
                        </select>
                      </InputLabel>
                      {state.comprova === 'no dia útil seguinte ao término do prazo' && (
                        <InputLabel label="Recurso interposto no último dia, após as 16h?">
                          <select
                            className="input"
                            value={state.apos16}
                            onChange={(e) => handleChange('apos16', e.target.value as YesNo)}
                          >
                            <option value="">Selecione</option>
                            <option value="sim">Sim</option>
                            <option value="não">Não</option>
                          </select>
                        </InputLabel>
                      )}
                    </>
                  )}
                </div>
              </SectionCard>
              <SectionCard title="Documentos e valores">
                <div className="grid md:grid-cols-2 gap-4">
                  <InputLabel label="Guia (Tribunal Superior) mov.">
                    <input
                      className="input"
                      placeholder="Ex.: 1.2"
                      value={state.guiast}
                      onChange={(e) => handleChange('guiast', e.target.value)}
                    />
                  </InputLabel>
                  <InputLabel label="Comprovante (Tribunal Superior) mov.">
                    <input
                      className="input"
                      placeholder="Ex.: 1.3"
                      value={state.compst}
                      onChange={(e) => handleChange('compst', e.target.value)}
                    />
                  </InputLabel>
                  <InputLabel label="Valor pago ST/FJ">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        className="input"
                        type="number"
                        step="0.01"
                        placeholder="STJ/STF"
                        value={state.valorst}
                        onChange={(e) => handleChange('valorst', e.target.value)}
                      />
                      <input
                        className="input"
                        type="number"
                        step="0.01"
                        placeholder="Funjus"
                        value={state.valorfj}
                        onChange={(e) => handleChange('valorfj', e.target.value)}
                      />
                    </div>
                  </InputLabel>
                  <InputLabel label="Guia vinculada no sistema?">
                    <select
                      className="input"
                      value={state.guiavinc}
                      onChange={(e) => handleChange('guiavinc', e.target.value as YesNo)}
                    >
                      <option value="">Selecione</option>
                      <option value="sim">Sim</option>
                      <option value="não">Não</option>
                    </select>
                  </InputLabel>
                  {state.guiavinc === 'não' && (
                    <>
                      <InputLabel label="Juntou guia (Funjus)?">
                        <select
                          className="input"
                          value={state.guia}
                          onChange={(e) => handleChange('guia', e.target.value as YesNo)}
                        >
                          <option value="">Selecione</option>
                          <option value="sim">Sim</option>
                          <option value="não">Não</option>
                        </select>
                      </InputLabel>
                      {state.guia === 'sim' && (
                        <>
                          <InputLabel label="Movimento (guia)">
                            <input
                              className="input"
                              placeholder="Ex.: 1.4"
                              value={state.guiamov}
                              onChange={(e) => handleChange('guiamov', e.target.value)}
                            />
                          </InputLabel>
                          <InputLabel label="Guia original para o recurso?">
                            <select
                              className="input"
                              value={state.guiorig}
                              onChange={(e) => handleChange('guiorig', e.target.value as YesNo)}
                            >
                              <option value="">Selecione</option>
                              <option value="sim">Sim</option>
                              <option value="não">Não</option>
                            </select>
                          </InputLabel>
                        </>
                      )}
                      <InputLabel label="Juntou comprovante?">
                        <select
                          className="input"
                          value={state.comp}
                          onChange={(e) => handleChange('comp', e.target.value as YesNo)}
                        >
                          <option value="">Selecione</option>
                          <option value="sim">Sim</option>
                          <option value="não">Não</option>
                        </select>
                      </InputLabel>
                      {state.comp === 'sim' && (
                        <>
                          <InputLabel label="Movimento (comprovante)">
                            <input
                              className="input"
                              placeholder="Ex.: 1.5"
                              value={state.compmov}
                              onChange={(e) => handleChange('compmov', e.target.value)}
                            />
                          </InputLabel>
                          <InputLabel label="Tipo de comprovante">
                            <select
                              className="input"
                              value={state.comptipo}
                              onChange={(e) =>
                                handleChange('comptipo', e.target.value as TriagemState['comptipo'])
                              }
                            >
                              <option value="">Selecione</option>
                              <option value="de pagamento">De pagamento</option>
                              <option value="de agendamento">De agendamento</option>
                            </select>
                          </InputLabel>
                          <InputLabel label="Código de barras">
                            <select
                              className="input"
                              value={state.codbar}
                              onChange={(e) =>
                                handleChange('codbar', e.target.value as TriagemState['codbar'])
                              }
                            >
                              <option value="">Selecione</option>
                              <option value="confere">Confere</option>
                              <option value="diverge ou guia ausente">Diverge ou guia ausente</option>
                            </select>
                          </InputLabel>
                        </>
                      )}
                    </>
                  )}
                  <InputLabel label="Sistema Uniformizado">
                    <select
                      className="input"
                      value={state.sisuni}
                      onChange={(e) => handleChange('sisuni', e.target.value as TriagemState['sisuni'])}
                    >
                      <option value="">Selecione</option>
                      <option value="regular">Regular</option>
                      <option value="irregular">Irregular</option>
                    </select>
                  </InputLabel>
                  <InputLabel label="COHAB LD? (parcial Funjus)">
                    <select
                      className="input"
                      value={state.parcial}
                      onChange={(e) => handleChange('parcial', e.target.value as YesNo)}
                    >
                      <option value="">Selecione</option>
                      <option value="sim">Sim</option>
                      <option value="não">Não</option>
                    </select>
                  </InputLabel>
                </div>
                <div className="mt-4 text-sm text-slate-600">
                  Valores devidos agora: Tribunal Superior R$ {outputs.deverST.toFixed(2)} | FUNJUS R${' '}
                  {outputs.deverFJ.toFixed(2)}
                </div>
              </SectionCard>
              <SectionCard title="Notas práticas">
                <ul className="space-y-2 text-sm text-slate-600">
                  <li>• Marque “de agendamento” se o comprovante não tem autenticação.</li>
                  <li>• Se houver ato incompatível com a gratuidade, o preparo será exigido.</li>
                  <li>• Campos de movimento ajudam a gerar a minuta/post-it automaticamente.</li>
                </ul>
              </SectionCard>
            </div>
          );
        case 'processo':
          return (
          <div className="grid lg:grid-cols-2 gap-4">
            <SectionCard title="Representação">
              <div className="grid md:grid-cols-2 gap-4">
                <InputLabel label="Subscritor">
                  <select
                    className="input"
                    value={state.subscritor}
                    onChange={(e) => handleChange('subscritor', e.target.value as Subscritor)}
                  >
                    <option value="">Selecione</option>
                    <option value="advogado particular">Advogado particular</option>
                    <option value="procurador público">Procurador público</option>
                    <option value="procurador nomeado">Procurador nomeado</option>
                    <option value="advogado em causa própria">Advogado em causa própria</option>
                  </select>
                </InputLabel>
                {state.subscritor === 'procurador nomeado' && (
                  <InputLabel label="Movimento (nomeação)">
                    <input
                      className="input"
                      placeholder="Ex.: 9.1"
                      value={state.nomemovi}
                      onChange={(e) => handleChange('nomemovi', e.target.value)}
                    />
                  </InputLabel>
                )}
                {state.subscritor === 'advogado particular' && (
                  <>
                    <InputLabel label="Movimentos (cadeia de poderes)">
                      <input
                        className="input"
                        placeholder="Ex.: 1.1; 9.1; via sistema"
                        value={state.movis}
                        onChange={(e) => handleChange('movis', e.target.value)}
                      />
                    </InputLabel>
                    <InputLabel label="Cadeia completa?">
                      <select
                        className="input"
                        value={state.cadeia}
                        onChange={(e) => handleChange('cadeia', e.target.value as YesNo)}
                      >
                        <option value="">Selecione</option>
                        <option value="sim">Sim</option>
                        <option value="não">Não</option>
                      </select>
                    </InputLabel>
                    {state.cadeia === 'não' && (
                      <InputLabel label="Poderes faltantes">
                        <select
                          className="input"
                          value={state.faltante}
                          onChange={(e) =>
                            handleChange('faltante', e.target.value as TriagemState['faltante'])
                          }
                        >
                          <option value="">Selecione</option>
                          <option value="ao próprio subscritor">Ao próprio subscritor</option>
                          <option value="a outro elo da cadeia">A outro elo da cadeia</option>
                        </select>
                      </InputLabel>
                    )}
                  </>
                )}
              </div>
            </SectionCard>
            <SectionCard title="Pedidos">
              <div className="grid md:grid-cols-2 gap-4">
                <InputLabel label="Efeito suspensivo">
                  <select
                    className="input"
                    value={state.suspefeito}
                    onChange={(e) =>
                      handleChange('suspefeito', e.target.value as TriagemState['suspefeito'])
                    }
                  >
                    <option value="">Selecione</option>
                    <option value="não requerido">Não requerido</option>
                    <option value="requerido no corpo do recurso">Requerido no corpo do recurso</option>
                    <option value="requerido em petição apartada">Requerido em petição apartada</option>
                  </select>
                </InputLabel>
                {state.suspefeito === 'requerido em petição apartada' && (
                  <InputLabel label="Autuado?">
                    <select
                      className="input"
                      value={state.autuado}
                      onChange={(e) => handleChange('autuado', e.target.value as YesNo)}
                    >
                      <option value="">Selecione</option>
                      <option value="sim">Sim</option>
                      <option value="não">Não</option>
                    </select>
                  </InputLabel>
                )}
                <InputLabel label="Exclusividade na intimação">
                  <select
                    className="input"
                    value={state.exclusivi}
                    onChange={(e) =>
                      handleChange('exclusivi', e.target.value as TriagemState['exclusivi'])
                    }
                  >
                    <option value="">Selecione</option>
                    <option value="requerida">Requerida</option>
                    <option value="não requerida">Não requerida</option>
                  </select>
                </InputLabel>
                {state.exclusivi === 'requerida' && (
                  <>
                    <InputLabel label="Procurador já cadastrado?">
                      <select
                        className="input"
                        value={state.cadastrada}
                        onChange={(e) => handleChange('cadastrada', e.target.value as YesNo)}
                      >
                        <option value="">Selecione</option>
                        <option value="sim">Sim</option>
                        <option value="não">Não</option>
                      </select>
                    </InputLabel>
                    {state.cadastrada === 'não' && (
                      <InputLabel label="Advogado regularmente constituído?">
                        <select
                          className="input"
                          value={state.regular}
                          onChange={(e) => handleChange('regular', e.target.value as YesNo)}
                        >
                          <option value="">Selecione</option>
                          <option value="sim">Sim</option>
                          <option value="não">Não</option>
                        </select>
                      </InputLabel>
                    )}
                  </>
                )}
              </div>
            </SectionCard>
            <SectionCard title="Processamento">
              <div className="grid md:grid-cols-2 gap-4">
                <InputLabel label="Contrarrazões">
                  <select
                    className="input"
                    value={state.contrarra}
                    onChange={(e) =>
                      handleChange('contrarra', e.target.value as TriagemState['contrarra'])
                    }
                  >
                    <option value="">Selecione</option>
                    <option value="apresentadas">Apresentadas</option>
                    <option value="ausente alguma">Ausente alguma</option>
                    <option value="ausentes">Ausentes</option>
                  </select>
                </InputLabel>
                {state.contrarra !== '' && state.contrarra !== 'ausentes' && (
                  <InputLabel label="Movimentos das contrarrazões/renúncia">
                    <input
                      className="input"
                      placeholder="Ex.: 6.1; 7.1 (renúncia)"
                      value={state.contramovis}
                      onChange={(e) => handleChange('contramovis', e.target.value)}
                    />
                  </InputLabel>
                )}
                {state.contrarra !== 'apresentadas' && (
                  <>
                    <InputLabel label="Recorrido(s) intimado(s)?">
                      <select
                        className="input"
                        value={state.intimado}
                        onChange={(e) => handleChange('intimado', e.target.value as YesNo)}
                      >
                        <option value="">Selecione</option>
                        <option value="sim">Sim</option>
                        <option value="não">Não</option>
                      </select>
                    </InputLabel>
                    {state.intimado === 'sim' && (
                      <>
                        <InputLabel label="Movimento de intimação">
                          <input
                            className="input"
                            placeholder="Ex.: 3.1"
                            value={state.intimovi}
                            onChange={(e) => handleChange('intimovi', e.target.value)}
                          />
                        </InputLabel>
                        <InputLabel label="Prazo em aberto para algum recorrido?">
                          <select
                            className="input"
                            value={state.crraberto}
                            onChange={(e) => handleChange('crraberto', e.target.value as YesNo)}
                          >
                            <option value="">Selecione</option>
                            <option value="sim">Sim</option>
                            <option value="não">Não</option>
                          </select>
                        </InputLabel>
                        {state.crraberto === 'não' && (
                          <InputLabel label="Decurso certificado?">
                            <select
                              className="input"
                              value={state.decursocrr}
                              onChange={(e) => handleChange('decursocrr', e.target.value as YesNo)}
                            >
                              <option value="">Selecione</option>
                              <option value="sim">Sim</option>
                              <option value="não">Não</option>
                            </select>
                          </InputLabel>
                        )}
                      </>
                    )}
                    {state.intimado === 'não' && (
                      <InputLabel label="Recorrido(s) sem advogado constituído?">
                        <select
                          className="input"
                          value={state.semadv}
                          onChange={(e) => handleChange('semadv', e.target.value as YesNo)}
                        >
                          <option value="">Selecione</option>
                          <option value="sim">Sim</option>
                          <option value="não">Não</option>
                        </select>
                      </InputLabel>
                    )}
                  </>
                )}
                <InputLabel label="Intervenção do MP?">
                  <select
                    className="input"
                    value={state.emepe}
                    onChange={(e) => handleChange('emepe', e.target.value as YesNo)}
                  >
                    <option value="">Selecione</option>
                    <option value="sim">Sim</option>
                    <option value="não">Não</option>
                  </select>
                </InputLabel>
                {state.emepe === 'sim' && (
                  <>
                    <InputLabel label="Manifestação nos autos?">
                      <select
                        className="input"
                        value={state.mani}
                        onChange={(e) => handleChange('mani', e.target.value as YesNo)}
                      >
                        <option value="">Selecione</option>
                        <option value="sim">Sim</option>
                        <option value="não">Não</option>
                      </select>
                    </InputLabel>
                    {state.mani === 'sim' && (
                      <>
                        <InputLabel label="Teor da manifestação">
                          <select
                            className="input"
                            value={state.teormani}
                            onChange={(e) =>
                              handleChange('teormani', e.target.value as TriagemState['teormani'])
                            }
                          >
                            <option value="">Selecione</option>
                            <option value="mera ciência">Mera ciência</option>
                            <option value="pela admissão">Pela admissão</option>
                            <option value="pela inadmissão">Pela inadmissão</option>
                            <option value="ausência de interesse">Ausência de interesse</option>
                          </select>
                        </InputLabel>
                        <InputLabel label="Movimento">
                          <input
                            className="input"
                            placeholder="Ex.: 9.1"
                            value={state.manimovis}
                            onChange={(e) => handleChange('manimovis', e.target.value)}
                          />
                        </InputLabel>
                        {state.teormani === 'mera ciência' && (
                          <InputLabel label="Decurso do prazo?">
                            <select
                              className="input"
                              value={state.decursomp}
                              onChange={(e) => handleChange('decursomp', e.target.value as YesNo)}
                            >
                              <option value="">Selecione</option>
                              <option value="sim">Sim</option>
                              <option value="não">Não</option>
                            </select>
                          </InputLabel>
                        )}
                      </>
                    )}
                    {state.mani === 'não' && (
                      <>
                        <InputLabel label="Autos remetidos?">
                          <select
                            className="input"
                            value={state.remetido}
                            onChange={(e) => handleChange('remetido', e.target.value as YesNo)}
                          >
                            <option value="">Selecione</option>
                            <option value="sim">Sim</option>
                            <option value="não">Não</option>
                          </select>
                        </InputLabel>
                        {state.remetido === 'sim' && (
                          <InputLabel label="Decurso do prazo?">
                            <select
                              className="input"
                              value={state.decursomp}
                              onChange={(e) => handleChange('decursomp', e.target.value as YesNo)}
                            >
                              <option value="">Selecione</option>
                              <option value="sim">Sim</option>
                              <option value="não">Não</option>
                            </select>
                          </InputLabel>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>
            </SectionCard>
          </div>
        );
        case 'resumo':
          return (
            <div className="space-y-4">
              <SectionCard title="Resultado da triagem">
                <div className="grid md:grid-cols-2 gap-3 text-sm text-slate-800">
                <div>
                  <strong>Tempestivo:</strong> {outputs.tempest.status}
                </div>
                <div>
                  <strong>Contrarrazões:</strong> {outputs.controut}
                </div>
                <div>
                  <strong>Ministério Público:</strong> {outputs.mpout}
                </div>
                <div>
                  <strong>GRU:</strong> {outputs.grout}
                </div>
                <div>
                  <strong>Funjus:</strong> {outputs.funjout}
                </div>
                <div>
                  <strong>Procuração/Nomeação:</strong> {outputs.procurout}
                </div>
                <div>
                  <strong>Exclusividade na intimação:</strong> {outputs.exclusout}
                </div>
                <div>
                  <strong>Efeito suspensivo:</strong> {outputs.suspefout}
                </div>
                <div>
                  <strong>Vencimento:</strong> {formatDate(outputs.tempest.venc)}
                </div>
                <div>
                  <strong>Prazo:</strong> {outputs.tempest.prazo || '—'} dias
                </div>
              </div>
            </SectionCard>
              <SectionCard title="Observações e minutas sugeridas">
                {outputs.observacoes.length === 0 ? (
                  <p className="text-sm text-slate-600">Nenhuma observação pendente.</p>
                ) : (
                  <ul className="list-disc pl-5 space-y-2 text-sm text-slate-700">
                  {outputs.observacoes.map((obs, idx) => (
                    <li key={idx}>{obs}</li>
                  ))}
                </ul>
                )}
              </SectionCard>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={downloadResumo}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-red-300 bg-red-600 text-white hover:bg-red-700 hover:shadow-sm transition"
                >
                  <FileText className="w-4 h-4" />
                  Baixar resumo (.txt)
                </button>
                <button
                  onClick={copyResumo}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 hover:shadow-sm transition"
                >
                  <ClipboardList className="w-4 h-4" />
                  {copied ? 'Copiado!' : 'Copiar resumo'}
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                <Pill>
                  Tribunal Superior: R$ {outputs.deverST.toFixed(2)} | FUNJUS: R${' '}
                {outputs.deverFJ.toFixed(2)}
              </Pill>
              <Pill>Intimação: {formatDate(outputs.tempest.intim)}</Pill>
              <Pill>Começo do prazo: {formatDate(outputs.tempest.comeco)}</Pill>
            </div>
      </div>
        );
        default:
          return null;
      }
    })();

    if (!content) return null;

    return (
      <div className="space-y-4">{content}</div>
    );
  };

  const tempestTone: 'neutral' | 'positive' | 'negative' =
    outputs.tempest.status === 'tempestivo'
      ? 'positive'
      : outputs.tempest.status === 'intempestivo'
      ? 'negative'
      : 'neutral';
  const contraTone: 'neutral' | 'positive' | 'negative' =
    outputs.controut === 'apresentadas'
      ? 'positive'
      : outputs.controut === 'não'
      ? 'negative'
      : 'neutral';

  return (
    <div className="min-h-screen page-bg text-slate-900">
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-xl shadow-[0_20px_60px_-40px_rgba(15,23,42,0.4)]">
        <div className="max-w-6xl mx-auto px-4 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-lg shadow-slate-300/60 flex items-center justify-center">
              <img src={simbaLogo} alt="Simba-JUD" className="h-full w-full object-cover" />
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Simba-JUD</p>
              <h1 className="text-xl font-semibold text-slate-900 leading-tight">Admissibilidade Recursal</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={clearStorage}
              className="text-sm px-3 py-2 rounded-lg border border-rose-200 bg-white/70 text-rose-700 hover:bg-rose-50 hover:shadow-sm transition"
            >
              Limpar cache
            </button>
            <button
              onClick={restart}
              className="text-sm px-3 py-2 rounded-lg border border-slate-900 bg-slate-900 text-white hover:bg-black transition shadow-sm"
            >
              Recomeçar
            </button>
            <button
              onClick={() => setState(loadState())}
              className="text-sm px-3 py-2 rounded-lg border border-slate-200 bg-white/80 hover:shadow-sm transition"
            >
              Restaurar último
            </button>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 pb-4">
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-slate-900 via-amber-500 to-emerald-500 transition-all"
              style={{ width: `${(step / (steps.length - 1)) * 100}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Etapa {step + 1} de {steps.length}: {steps[step].label}
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          <MetricCard
            label="Tempestividade"
            value={outputs.tempest.status === 'pendente' ? 'Pendente' : outputs.tempest.status}
            helper={`Venc.: ${formatDate(outputs.tempest.venc)}`}
            tone={tempestTone}
          />
          <MetricCard
            label="Prazo"
            value={`${outputs.tempest.prazo || '—'} dias`}
            helper={`Intimação: ${formatDate(outputs.tempest.intim)}`}
          />
          <MetricCard
            label="Preparo devido"
            value={`R$ ${outputs.deverST.toFixed(2)}`}
            helper={`Funjus R$ ${outputs.deverFJ.toFixed(2)}`}
          />
          <MetricCard
            label="Contrarrazões / MP"
            value={outputs.controut || '—'}
            helper={`MP: ${outputs.mpout}`}
            tone={contraTone}
          />
        </div>
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-white/85 backdrop-blur-sm border border-slate-200/80 rounded-2xl p-5 shadow-lg shadow-slate-200/70">
            <div className="flex items-center gap-2 mb-3">
              <ClipboardList className="w-5 h-5 text-slate-700" />
              <span className="text-sm text-slate-700 font-semibold uppercase tracking-wide">Fluxo</span>
            </div>
            <div className="grid sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {steps.map((s, idx) => {
                const Icon = s.icon;
                const active = idx === step;
                const done = idx < step;
                const stateClasses = active
                  ? 'border-slate-900 bg-slate-900 text-white shadow-lg shadow-slate-300/60'
                  : done
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800 shadow-sm shadow-emerald-100/70'
                  : 'border-slate-200 bg-white text-slate-700 shadow-sm shadow-slate-100/80';
                return (
                  <div
                    key={s.id}
                    className={`flex items-center gap-2 px-3 py-3 rounded-xl border transition shadow-[0_4px_16px_-10px_rgba(0,0,0,0.25)] ${stateClasses}`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{s.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

            <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-2xl p-6 shadow-xl shadow-slate-200/70">
            {renderStep()}
            <div className="mt-6 flex items-center justify-between">
              <button
                onClick={prev}
                disabled={step === 0}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 text-slate-800 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-sm transition"
              >
                <ChevronLeft className="w-4 h-4" />
                Voltar
              </button>
              {step < steps.length - 1 ? (
                <button
                  onClick={next}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-black transition"
                >
                  Avançar
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={restart}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition"
                >
                  Nova triagem
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);

// Tailwind-like input styling via Tailwind CDN
const style = document.createElement('style');
style.innerHTML = `
.page-bg {
  background:
    radial-gradient(circle at 15% 20%, rgba(148, 163, 184, 0.12), transparent 32%),
    radial-gradient(circle at 85% 10%, rgba(226, 232, 240, 0.28), transparent 30%),
    linear-gradient(180deg, #f9fafb 0%, #eef2f6 100%);
}
.input {
  width: 100%;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  padding: 0.5rem 0.75rem;
  background: #ffffff;
  color: #0f172a;
  font-size: 0.875rem;
  line-height: 1.4;
}
.input:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(15, 23, 42, 0.2);
  border-color: rgba(15, 23, 42, 0.55);
}
`;
document.head.appendChild(style);
