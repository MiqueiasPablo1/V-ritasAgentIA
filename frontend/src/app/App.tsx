import { useState, useRef, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  LayoutDashboard,
  BriefcaseBusiness,
  MessageSquare,
  Lightbulb,
  TrendingUp,
  TrendingDown,
  Send,
  ChevronUp,
  ChevronDown,
  Bell,
  Settings,
  LogOut,
  Bot,
  User,
  AlertTriangle,
  ShieldCheck,
  BarChart3,
  ArrowUpRight,
  Paperclip,
  FileText,
  FileSpreadsheet,
  Presentation,
  X,
  Eye,
  EyeOff,
  Lock,
  Mail,
  UserPlus,
  CheckCircle2,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type AuthMode = "login" | "register";
type Screen = "dashboard" | "portfolio" | "chat" | "recommendations";

interface LocalUser {
  name: string;
  email: string;
  password: string;
  profile: string;
}

interface AttachedFile {
  name: string;
  size: number;
  type: string;
}

interface Message {
  id: number;
  role: "user" | "ai";
  text: string;
  time: string;
  files?: AttachedFile[];
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const performanceData = [
  { month: "Jan", valor: 210000 },
  { month: "Fev", valor: 218500 },
  { month: "Mar", valor: 213200 },
  { month: "Abr", valor: 225800 },
  { month: "Mai", valor: 231000 },
  { month: "Jun", valor: 228400 },
  { month: "Jul", valor: 241600 },
  { month: "Ago", valor: 238900 },
  { month: "Set", valor: 252100 },
  { month: "Out", valor: 258400 },
  { month: "Nov", valor: 265700 },
  { month: "Dez", valor: 271300 },
];

const allocationData = [
  { name: "Renda Fixa", value: 42, color: "#2E7D52" },
  { name: "Ações BR", value: 23, color: "#4CAF7A" },
  { name: "Ações EUA", value: 18, color: "#7FB3A0" },
  { name: "FIIs", value: 11, color: "#1B4D32" },
  { name: "Cripto", value: 6, color: "#3D6B50" },
];

const holdings = [
  { ticker: "PETR4", name: "Petrobras PN", qty: 500, avgPrice: 31.2, currentPrice: 38.75, sector: "Energia" },
  { ticker: "VALE3", name: "Vale ON", qty: 300, avgPrice: 68.4, currentPrice: 72.1, sector: "Mineração" },
  { ticker: "ITUB4", name: "Itaú Unibanco PN", qty: 800, avgPrice: 22.8, currentPrice: 25.4, sector: "Financeiro" },
  { ticker: "WEGE3", name: "WEG ON", qty: 200, avgPrice: 35.6, currentPrice: 42.3, sector: "Industrial" },
  { ticker: "MGLU3", name: "Magazine Luiza ON", qty: 1200, avgPrice: 4.1, currentPrice: 3.2, sector: "Varejo" },
  { ticker: "BBAS3", name: "Banco do Brasil ON", qty: 400, avgPrice: 48.9, currentPrice: 56.7, sector: "Financeiro" },
  { ticker: "RENT3", name: "Localiza ON", qty: 150, avgPrice: 62.0, currentPrice: 71.5, sector: "Serviços" },
  { ticker: "TESOURO SELIC", name: "Tesouro Selic 2027", qty: 1, avgPrice: 14200, currentPrice: 14890, sector: "Renda Fixa" },
];

const recommendations = [
  {
    id: 1,
    type: "compra",
    ticker: "LREN3",
    name: "Lojas Renner ON",
    reason: "Valuation atrativo com P/L de 12x e recuperação consistente das margens operacionais. Setor de varejo apresentando resiliência acima do esperado.",
    confidence: 82,
    risk: "Moderado",
    targetPrice: 18.5,
    currentPrice: 14.2,
    upside: 30.3,
  },
  {
    id: 2,
    type: "compra",
    ticker: "EGIE3",
    name: "Engie Brasil ON",
    reason: "Ativo defensivo com histórico consistente de dividendos. Setor elétrico beneficiado pela revisão tarifária prevista para o próximo ciclo regulatório.",
    confidence: 91,
    risk: "Baixo",
    targetPrice: 47.0,
    currentPrice: 41.8,
    upside: 12.4,
  },
  {
    id: 3,
    type: "venda",
    ticker: "MGLU3",
    name: "Magazine Luiza ON",
    reason: "Posição com prejuízo acumulado. Deterioração do balanço e pressão de juros sobre o modelo de negócios. Recomendamos realocação para posições mais defensivas.",
    confidence: 76,
    risk: "Alto",
    targetPrice: 2.8,
    currentPrice: 3.2,
    upside: -12.5,
  },
  {
    id: 4,
    type: "compra",
    ticker: "BBSE3",
    name: "BB Seguridade ON",
    reason: "Setor de seguros com expansão acelerada. Empresa com ROE elevado (acima de 50%) e payout generoso. Baixa sensibilidade ao ciclo de crédito.",
    confidence: 88,
    risk: "Baixo",
    targetPrice: 38.0,
    currentPrice: 34.5,
    upside: 10.1,
  },
];

const initialMessages: Message[] = [
  {
    id: 1,
    role: "ai",
    text: "Olá! Sou o seu Assessor de Investimentos com IA. Tenho acesso ao seu portfólio e posso ajudá-lo com análises, recomendações e esclarecimentos sobre o mercado financeiro. Como posso ajudá-lo hoje?",
    time: "09:00",
  },
];

const aiResponses: Record<string, string> = {
  default:
    "Entendo sua pergunta. Com base no seu perfil de risco moderado e na composição atual do seu portfólio, sugiro avaliarmos as oportunidades em renda fixa de curto prazo, que atualmente oferecem retornos atrativos com baixa volatilidade. Gostaria que eu aprofundasse algum ponto específico?",
  selic:
    "A taxa Selic atualmente em 10,75% ao ano torna os títulos pós-fixados muito competitivos. Para seu perfil, recomendo manter entre 30-40% em TESOURO SELIC, o que garante liquidez e retorno real positivo. Quer ver como isso impactaria sua alocação atual?",
  carteira:
    "Sua carteira está bem diversificada. O maior risco identificado é a posição em MGLU3, com -22% de retorno. Já incluí uma recomendação de venda nessa posição. Sua carteira total cresceu 29,2% nos últimos 12 meses, superando o IBOVESPA em 11,4 pontos percentuais.",
  dividendos:
    "Para dividendos, destaco BBSE3 e EGIE3 na sua lista de recomendações. BBSE3 tem dividend yield médio de 8,2% nos últimos 3 anos, enquanto EGIE3 distribui consistentemente acima de 6% ao ano. São boas opções para gerar renda passiva.",
  documento:
    "Recebi o documento e já estou analisando o conteúdo. Identifiquei informações relevantes sobre sua situação financeira. Com base nos dados apresentados, posso elaborar um diagnóstico detalhado e cruzar com o seu portfólio atual. Deseja que eu destaque os pontos de atenção ou prefere uma visão geral primeiro?",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function pct(current: number, avg: number) {
  return (((current - avg) / avg) * 100).toFixed(2);
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border px-3 py-2 rounded text-xs">
        <p className="text-muted-foreground mb-1">{label}</p>
        <p className="text-[#4CAF7A] font-medium" style={{ fontFamily: "JetBrains Mono, monospace" }}>
          {fmt(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({
  active,
  onNavigate,
  userInitials,
  userName,
  userProfile,
  onLogout,
}: {
  active: Screen;
  onNavigate: (s: Screen) => void;
  userInitials: string;
  userName: string;
  userProfile: string;
  onLogout: () => void;
}) {
  const links: { screen: Screen; icon: typeof LayoutDashboard; label: string }[] = [
    { screen: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { screen: "portfolio", icon: BriefcaseBusiness, label: "Portfólio" },
    { screen: "chat", icon: MessageSquare, label: "Assessor IA" },
    { screen: "recommendations", icon: Lightbulb, label: "Recomendações" },
  ];

  return (
    <aside
      className="w-60 flex-shrink-0 flex flex-col border-r border-border h-full"
      style={{ background: "#060806" }}
    >
      {/* Logo */}
      <div className="px-6 py-7 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded flex items-center justify-center" style={{ background: "#2E7D52" }}>
            <BarChart3 size={15} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground tracking-wide" style={{ fontFamily: "DM Serif Display, serif" }}>
              Véritas
            </p>
            <p className="text-[10px] text-muted-foreground tracking-widest uppercase">Capital IA</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-0.5">
        {links.map(({ screen, icon: Icon, label }) => {
          const isActive = active === screen;
          return (
            <button
              key={screen}
              onClick={() => onNavigate(screen)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-all duration-150 text-left ${
                isActive
                  ? "bg-accent text-[#4CAF7A] font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-3 pb-5 space-y-0.5">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-all">
          <Settings size={15} />
          Configurações
        </button>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
        >
          <LogOut size={15} />
          Sair
        </button>
        <div className="mt-3 px-3 py-3 rounded bg-secondary border border-border flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold" style={{ background: "#1B4D32", color: "#4CAF7A" }}>
            {userInitials}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-foreground truncate">{userName}</p>
            <p className="text-[10px] text-muted-foreground">Perfil {userProfile}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ─── Topbar ───────────────────────────────────────────────────────────────────
function Topbar({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header className="h-14 flex-shrink-0 border-b border-border flex items-center justify-between px-7">
      <div>
        <h1 className="text-sm font-semibold text-foreground" style={{ fontFamily: "DM Serif Display, serif" }}>
          {title}
        </h1>
        <p className="text-[11px] text-muted-foreground">{subtitle}</p>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[11px] text-muted-foreground" style={{ fontFamily: "JetBrains Mono, monospace" }}>
          {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}
        </span>
        <button className="relative w-8 h-8 flex items-center justify-center rounded hover:bg-secondary transition-all">
          <Bell size={15} className="text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#4CAF7A]" />
        </button>
      </div>
    </header>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({
  label,
  value,
  sub,
  positive,
}: {
  label: string;
  value: string;
  sub: string;
  positive?: boolean;
}) {
  return (
    <div className="bg-card border border-border rounded-lg px-5 py-4">
      <p className="text-[11px] text-muted-foreground uppercase tracking-widest mb-2">{label}</p>
      <p
        className="text-xl font-medium text-foreground mb-1"
        style={{ fontFamily: "JetBrains Mono, monospace" }}
      >
        {value}
      </p>
      <div className="flex items-center gap-1.5">
        {positive !== undefined &&
          (positive ? (
            <ChevronUp size={13} className="text-[#4CAF7A]" />
          ) : (
            <ChevronDown size={13} className="text-destructive" />
          ))}
        <p className={`text-xs ${positive === undefined ? "text-muted-foreground" : positive ? "text-[#4CAF7A]" : "text-destructive"}`}>
          {sub}
        </p>
      </div>
    </div>
  );
}

// ─── Dashboard Screen ─────────────────────────────────────────────────────────
function DashboardScreen() {
  return (
    <div className="flex-1 overflow-y-auto px-7 py-6 space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <KpiCard label="Patrimônio Total" value="R$ 271.300" sub="+29,2% nos últimos 12 meses" positive={true} />
        <KpiCard label="Rendimento Mensal" value="R$ 5.600" sub="+2,1% no mês" positive={true} />
        <KpiCard label="Dividendos Recebidos" value="R$ 3.840" sub="Últimos 12 meses" />
        <KpiCard label="Beta da Carteira" value="0,82" sub="Menor risco que IBOV" positive={true} />
      </div>

      {/* Chart + Allocation */}
      <div className="grid grid-cols-3 gap-4">
        {/* Area chart */}
        <div className="col-span-2 bg-card border border-border rounded-lg p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest">Evolução do Patrimônio</p>
              <p className="text-sm font-medium text-foreground mt-0.5">2024 — Acumulado</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#4CAF7A]" style={{ fontFamily: "JetBrains Mono, monospace" }}>
              <TrendingUp size={13} />
              +29,2%
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={performanceData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="areaGradientGreen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2E7D52" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#2E7D52" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(46,125,82,0.1)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#5A7A5A" }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 10, fill: "#5A7A5A", fontFamily: "JetBrains Mono" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                width={38}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="valor" stroke="#2E7D52" strokeWidth={2} fill="url(#areaGradientGreen)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie */}
        <div className="bg-card border border-border rounded-lg p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-4">Alocação de Ativos</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={allocationData}
                cx="50%"
                cy="50%"
                innerRadius={48}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
              >
                {allocationData.map((entry) => (
                  <Cell key={`cell-${entry.name}`} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {allocationData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
                <span className="text-foreground" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                  {item.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top positions */}
      <div className="bg-card border border-border rounded-lg p-5">
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-4">Maiores Posições</p>
        <div className="space-y-3">
          {holdings.slice(0, 5).map((h) => {
            const ret = parseFloat(pct(h.currentPrice, h.avgPrice));
            const pos = ret >= 0;
            return (
              <div key={h.ticker} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded flex items-center justify-center text-[10px] font-semibold" style={{ background: "#162216", color: "#4CAF7A" }}>
                    {h.ticker.slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-foreground">{h.ticker}</p>
                    <p className="text-[10px] text-muted-foreground">{h.sector}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-foreground" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                    {fmt(h.currentPrice * h.qty)}
                  </p>
                  <p className={`text-[10px] flex items-center justify-end gap-0.5 ${pos ? "text-[#4CAF7A]" : "text-destructive"}`}>
                    {pos ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                    {pos ? "+" : ""}{ret}%
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Portfolio Screen ─────────────────────────────────────────────────────────
function PortfolioScreen() {
  const totalValue = holdings.reduce((s, h) => s + h.currentPrice * h.qty, 0);

  return (
    <div className="flex-1 overflow-y-auto px-7 py-6 space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest">Valor Total em Carteira</p>
          <p className="text-3xl font-medium text-foreground mt-1" style={{ fontFamily: "DM Serif Display, serif" }}>
            {fmt(totalValue)}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-[#4CAF7A]">
          <TrendingUp size={15} />
          <span style={{ fontFamily: "JetBrains Mono, monospace" }}>+29,2% (12m)</span>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              {["Ativo", "Setor", "Qtd.", "Preço Médio", "Preço Atual", "Valor em Carteira", "Retorno"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-muted-foreground uppercase tracking-wider font-medium text-[10px]">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {holdings.map((h, i) => {
              const ret = parseFloat(pct(h.currentPrice, h.avgPrice));
              const pos = ret >= 0;
              return (
                <tr
                  key={h.ticker}
                  className={`border-b border-border last:border-0 hover:bg-secondary transition-colors ${i % 2 === 0 ? "" : "bg-secondary/30"}`}
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{h.ticker}</p>
                    <p className="text-[10px] text-muted-foreground">{h.name}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{h.sector}</td>
                  <td className="px-4 py-3 text-foreground" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                    {h.qty.toLocaleString("pt-BR")}
                  </td>
                  <td className="px-4 py-3 text-foreground" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                    {fmt(h.avgPrice)}
                  </td>
                  <td className="px-4 py-3 text-foreground" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                    {fmt(h.currentPrice)}
                  </td>
                  <td className="px-4 py-3 text-foreground font-medium" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                    {fmt(h.currentPrice * h.qty)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`flex items-center gap-1 font-medium ${pos ? "text-[#4CAF7A]" : "text-destructive"}`}
                      style={{ fontFamily: "JetBrains Mono, monospace" }}
                    >
                      {pos ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                      {pos ? "+" : ""}{ret}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <KpiCard label="Maior Alta" value="PETR4" sub="+24,2% no período" positive={true} />
        <KpiCard label="Maior Queda" value="MGLU3" sub="-21,9% no período" positive={false} />
        <KpiCard label="Dividend Yield Médio" value="6,8% a.a." sub="Carteira ponderada" />
      </div>
    </div>
  );
}

// ─── File icon helper ─────────────────────────────────────────────────────────
function fileIcon(type: string) {
  if (type.includes("spreadsheet") || type.includes("excel") || type.includes("csv"))
    return <FileSpreadsheet size={14} className="text-[#4CAF7A]" />;
  if (type.includes("presentation") || type.includes("powerpoint"))
    return <Presentation size={14} className="text-[#C9A84C]" />;
  return <FileText size={14} className="text-[#5B8DEF]" />;
}

function fileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileBadge({ file, onRemove }: { file: AttachedFile; onRemove?: () => void }) {
  return (
    <div
      className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-xs max-w-xs"
      style={{ background: "#111811" }}
    >
      {fileIcon(file.type)}
      <div className="min-w-0 flex-1">
        <p className="text-foreground truncate font-medium leading-tight">{file.name}</p>
        <p className="text-muted-foreground text-[10px]">{fileSize(file.size)}</p>
      </div>
      {onRemove && (
        <button
          onClick={onRemove}
          className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
}

// ─── Chat Screen ──────────────────────────────────────────────────────────────
const ACCEPTED_TYPES = [
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".ppt",
  ".pptx",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
].join(",");

function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<AttachedFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function getTime() {
    return new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  }

  function pickResponse(text: string, hasFiles: boolean): string {
    if (hasFiles) return aiResponses.documento;
    const t = text.toLowerCase();
    if (t.includes("selic") || t.includes("juros")) return aiResponses.selic;
    if (t.includes("carteira") || t.includes("portfólio") || t.includes("portfolio")) return aiResponses.carteira;
    if (t.includes("dividendo")) return aiResponses.dividendos;
    return aiResponses.default;
  }

  function addFiles(fileList: FileList) {
    const added: AttachedFile[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const f = fileList[i];
      added.push({ name: f.name, size: f.size, type: f.type });
    }
    setPendingFiles((prev) => [...prev, ...added]);
  }

  function removeFile(idx: number) {
    setPendingFiles((prev) => prev.filter((_, i) => i !== idx));
  }

  function send() {
    const hasText = input.trim().length > 0;
    const hasFiles = pendingFiles.length > 0;
    if ((!hasText && !hasFiles) || loading) return;

    const userMsg: Message = {
      id: Date.now(),
      role: "user",
      text: input.trim() || (hasFiles ? "Segue o(s) documento(s) para análise." : ""),
      time: getTime(),
      files: hasFiles ? [...pendingFiles] : undefined,
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setPendingFiles([]);
    setLoading(true);

    setTimeout(() => {
      const aiMsg: Message = {
        id: Date.now() + 1,
        role: "ai",
        text: pickResponse(userMsg.text, hasFiles),
        time: getTime(),
      };
      setMessages((m) => [...m, aiMsg]);
      setLoading(false);
    }, 1400);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
  }

  return (
    <div
      className="flex-1 flex flex-col min-h-0"
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
    >
      {/* Drop overlay */}
      {dragOver && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center pointer-events-none"
          style={{ background: "rgba(8,10,8,0.85)", border: "2px dashed #2E7D52" }}>
          <Paperclip size={32} className="text-[#4CAF7A] mb-3" />
          <p className="text-sm text-[#4CAF7A] font-medium">Solte o arquivo para anexar</p>
          <p className="text-xs text-muted-foreground mt-1">PDF, Word, Excel ou PowerPoint</p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-7 py-6 space-y-5">
        <div className="max-w-2xl mx-auto space-y-5">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              <div
                className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center ${
                  msg.role === "ai" ? "bg-accent" : "bg-secondary"
                }`}
              >
                {msg.role === "ai" ? (
                  <Bot size={13} className="text-[#4CAF7A]" />
                ) : (
                  <User size={13} className="text-muted-foreground" />
                )}
              </div>
              <div className={`max-w-[75%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col gap-2`}>
                {/* Attached files */}
                {msg.files && msg.files.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    {msg.files.map((f, i) => (
                      <FileBadge key={i} file={f} />
                    ))}
                  </div>
                )}
                {/* Text bubble */}
                {msg.text && (
                  <div
                    className={`px-4 py-3 rounded-lg text-sm leading-relaxed ${
                      msg.role === "ai"
                        ? "bg-card border border-border text-foreground"
                        : "text-foreground"
                    }`}
                    style={msg.role === "user" ? { background: "#162216", border: "1px solid rgba(46,125,82,0.3)" } : {}}
                  >
                    {msg.text}
                  </div>
                )}
                <p className="text-[10px] text-muted-foreground px-1">{msg.time}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center bg-accent">
                <Bot size={13} className="text-[#4CAF7A]" />
              </div>
              <div className="bg-card border border-border rounded-lg px-4 py-3 flex items-center gap-1.5">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-[#2E7D52] animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
      </div>

      {/* Suggestions */}
      <div className="px-7 pb-2">
        <div className="max-w-2xl mx-auto flex gap-2 flex-wrap">
          {["Como está minha carteira?", "Qual a taxa Selic hoje?", "Melhores dividendos?"].map((s) => (
            <button
              key={s}
              onClick={() => setInput(s)}
              className="text-xs px-3 py-1.5 rounded-full border border-border text-muted-foreground hover:text-[#4CAF7A] hover:border-[#2E7D52] transition-all"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Pending file previews */}
      {pendingFiles.length > 0 && (
        <div className="px-7 pt-2">
          <div className="max-w-2xl mx-auto flex flex-wrap gap-2 pb-2">
            {pendingFiles.map((f, i) => (
              <FileBadge key={i} file={f} onRemove={() => removeFile(i)} />
            ))}
          </div>
        </div>
      )}

      {/* Input bar */}
      <div className="px-7 pb-6 pt-3 border-t border-border">
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES}
          multiple
          className="hidden"
          onChange={(e) => { if (e.target.files) { addFiles(e.target.files); e.target.value = ""; } }}
        />
        <div className="max-w-2xl mx-auto flex gap-2 items-center">
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Anexar documento"
            className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-[#4CAF7A] hover:border-[#2E7D52] transition-all"
          >
            <Paperclip size={16} />
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Pergunte ao seu assessor ou envie um documento…"
            className="flex-1 bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-[#2E7D52] transition-colors"
          />
          <button
            onClick={send}
            disabled={(!input.trim() && pendingFiles.length === 0) || loading}
            className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-lg transition-all disabled:opacity-40"
            style={{ background: "#2E7D52" }}
          >
            <Send size={15} className="text-white" />
          </button>
        </div>
        <p className="max-w-2xl mx-auto mt-2 text-[10px] text-muted-foreground">
          Formatos aceitos: PDF, Word (.doc/.docx), Excel (.xls/.xlsx), PowerPoint (.ppt/.pptx) · Arraste e solte ou clique em <Paperclip size={9} className="inline" />
        </p>
      </div>
    </div>
  );
}

// ─── Recommendations Screen ───────────────────────────────────────────────────
function RecommendationsScreen() {
  const riskColor: Record<string, string> = {
    Baixo: "#4CAF7A",
    Moderado: "#C9A84C",
    Alto: "#C0392B",
  };

  const riskIcon: Record<string, typeof ShieldCheck> = {
    Baixo: ShieldCheck,
    Moderado: AlertTriangle,
    Alto: AlertTriangle,
  };

  return (
    <div className="flex-1 overflow-y-auto px-7 py-6 space-y-5">
      <div className="flex items-center justify-between mb-1">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest">Geradas por IA</p>
          <p className="text-sm text-foreground mt-0.5">
            {recommendations.length} recomendações ativas com base no seu perfil e mercado atual
          </p>
        </div>
        <span className="text-[10px] px-2 py-1 rounded" style={{ background: "#162216", color: "#4CAF7A", fontFamily: "JetBrains Mono, monospace" }}>
          Atualizado em {new Date().toLocaleDateString("pt-BR")}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {recommendations.map((rec) => {
          const isBuy = rec.type === "compra";
          const RiskIcon = riskIcon[rec.risk];
          return (
            <div key={rec.id} className="bg-card border border-border rounded-lg p-5 flex flex-col gap-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded flex items-center justify-center text-xs font-semibold"
                    style={{ background: isBuy ? "#162216" : "#2A0D0D", color: isBuy ? "#4CAF7A" : "#C0392B" }}
                  >
                    {rec.ticker.slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{rec.ticker}</p>
                    <p className="text-[10px] text-muted-foreground">{rec.name}</p>
                  </div>
                </div>
                <span
                  className="text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-widest"
                  style={{
                    background: isBuy ? "rgba(46,125,82,0.15)" : "rgba(192,57,43,0.15)",
                    color: isBuy ? "#4CAF7A" : "#E05252",
                  }}
                >
                  {rec.type}
                </span>
              </div>

              {/* Reason */}
              <p className="text-xs text-muted-foreground leading-relaxed">{rec.reason}</p>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-border">
                <div>
                  <p className="text-[10px] text-muted-foreground mb-1">Preço atual</p>
                  <p className="text-xs text-foreground" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                    R$ {rec.currentPrice.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground mb-1">Preço-alvo</p>
                  <p className="text-xs text-foreground" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                    R$ {rec.targetPrice.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground mb-1">Upside</p>
                  <p
                    className="text-xs font-semibold flex items-center gap-0.5"
                    style={{ fontFamily: "JetBrains Mono, monospace", color: rec.upside >= 0 ? "#4CAF7A" : "#E05252" }}
                  >
                    {rec.upside >= 0 ? <ArrowUpRight size={11} /> : <TrendingDown size={11} />}
                    {rec.upside >= 0 ? "+" : ""}{rec.upside.toFixed(1)}%
                  </p>
                </div>
              </div>

              {/* Confidence + Risk */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex-1 mr-4">
                  <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                    <span>Confiança da IA</span>
                    <span style={{ fontFamily: "JetBrains Mono, monospace" }}>{rec.confidence}%</span>
                  </div>
                  <div className="h-1 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${rec.confidence}%`, background: "#2E7D52" }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[10px]" style={{ color: riskColor[rec.risk] }}>
                  <RiskIcon size={12} />
                  <span>{rec.risk}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Disclaimer */}
      <p className="text-[10px] text-muted-foreground border border-border rounded px-4 py-3 leading-relaxed">
        <strong className="text-foreground">Aviso:</strong> As recomendações acima são geradas por algoritmos de inteligência artificial com base em dados públicos e no perfil de risco cadastrado. Não constituem oferta de valores mobiliários nem recomendação de investimento formal. Consulte sempre um assessor humano habilitado pela CVM antes de tomar decisões de investimento.
      </p>
    </div>
  );
}

// ─── Auth Screen ──────────────────────────────────────────────────────────────
const STORAGE_KEY = "veritas_users";
const SESSION_KEY = "veritas_session";

function loadUsers(): LocalUser[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}
function saveUsers(users: LocalUser[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

const INVESTOR_PROFILES = [
  { id: "conservador", label: "Conservador", desc: "Prioriza segurança e preservação do capital" },
  { id: "moderado", label: "Moderado", desc: "Equilíbrio entre rentabilidade e risco" },
  { id: "arrojado", label: "Arrojado", desc: "Aceita maior volatilidade por maior retorno" },
];

function PasswordInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-secondary border border-border rounded-lg pl-9 pr-10 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-[#2E7D52] transition-colors"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
      >
        {show ? <EyeOff size={14} /> : <Eye size={14} />}
      </button>
    </div>
  );
}

function AuthScreen({ onAuth }: { onAuth: (user: LocalUser) => void }) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Login fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register fields
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [regProfile, setRegProfile] = useState("moderado");

  function switchMode(m: AuthMode) {
    setMode(m);
    setError("");
    setSuccess("");
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!loginEmail || !loginPassword) { setError("Preencha todos os campos."); return; }
    const users = loadUsers();
    const found = users.find((u) => u.email.toLowerCase() === loginEmail.toLowerCase() && u.password === loginPassword);
    if (!found) { setError("E-mail ou senha incorretos."); return; }
    localStorage.setItem(SESSION_KEY, JSON.stringify(found));
    onAuth(found);
  }

  function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!regName || !regEmail || !regPassword || !regConfirm) { setError("Preencha todos os campos."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail)) { setError("E-mail inválido."); return; }
    if (regPassword.length < 6) { setError("A senha deve ter ao menos 6 caracteres."); return; }
    if (regPassword !== regConfirm) { setError("As senhas não coincidem."); return; }
    const users = loadUsers();
    if (users.find((u) => u.email.toLowerCase() === regEmail.toLowerCase())) {
      setError("Este e-mail já está cadastrado.");
      return;
    }
    const newUser: LocalUser = { name: regName, email: regEmail, password: regPassword, profile: regProfile };
    saveUsers([...users, newUser]);
    setSuccess("Conta criada com sucesso!");
    setTimeout(() => {
      setSuccess("");
      setMode("login");
      setLoginEmail(regEmail);
      setLoginPassword("");
    }, 1600);
  }

  return (
    <div className="size-full flex bg-background" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Left panel — brand */}
      <div
        className="hidden lg:flex flex-col justify-between w-[44%] flex-shrink-0 px-14 py-12 relative overflow-hidden"
        style={{ background: "#060A06" }}
      >
        {/* Subtle grid texture */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(46,125,82,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(46,125,82,0.04) 1px,transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* Glow */}
        <div
          className="absolute bottom-0 left-0 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(46,125,82,0.18) 0%, transparent 70%)", transform: "translate(-30%, 30%)" }}
        />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "#2E7D52" }}>
            <BarChart3 size={18} className="text-white" />
          </div>
          <div>
            <p className="text-lg font-semibold text-foreground tracking-wide" style={{ fontFamily: "DM Serif Display, serif" }}>
              Véritas
            </p>
            <p className="text-[10px] text-muted-foreground tracking-widest uppercase">Capital IA</p>
          </div>
        </div>

        {/* Headline */}
        <div className="relative space-y-5">
          <h2
            className="text-4xl leading-tight text-foreground"
            style={{ fontFamily: "DM Serif Display, serif" }}
          >
            Inteligência artificial a serviço do seu patrimônio.
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
            Análises em tempo real, recomendações personalizadas e um assessor disponível 24 horas por dia.
          </p>
          <div className="space-y-3 pt-2">
            {[
              "Portfólio monitorado em tempo real",
              "Recomendações geradas por IA",
              "Análise de documentos financeiros",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2.5 text-xs text-muted-foreground">
                <CheckCircle2 size={13} className="text-[#2E7D52] flex-shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="relative text-[10px] text-muted-foreground">
          © {new Date().getFullYear()} Véritas Capital IA. Todos os direitos reservados.
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-8 py-12 overflow-y-auto">
        <div className="w-full max-w-md space-y-7">

          {/* Tab switcher */}
          <div className="flex rounded-lg border border-border overflow-hidden" style={{ background: "#0D110D" }}>
            {(["login", "register"] as AuthMode[]).map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`flex-1 py-2.5 text-sm font-medium transition-all ${
                  mode === m
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                style={mode === m ? { background: "#162216", color: "#4CAF7A" } : {}}
              >
                {m === "login" ? "Entrar" : "Criar conta"}
              </button>
            ))}
          </div>

          {/* ── Login Form ── */}
          {mode === "login" && (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <p className="text-xl text-foreground mb-1" style={{ fontFamily: "DM Serif Display, serif" }}>
                  Bem-vindo de volta
                </p>
                <p className="text-xs text-muted-foreground">Acesse sua conta para continuar</p>
              </div>

              <div className="space-y-3">
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full bg-secondary border border-border rounded-lg pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-[#2E7D52] transition-colors"
                  />
                </div>
                <PasswordInput value={loginPassword} onChange={setLoginPassword} placeholder="Senha" />
              </div>

              <div className="flex justify-end">
                <button type="button" className="text-xs text-muted-foreground hover:text-[#4CAF7A] transition-colors">
                  Esqueci minha senha
                </button>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2.5">
                  <AlertTriangle size={13} />
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg text-sm font-medium transition-all hover:opacity-90 active:scale-[0.99]"
                style={{ background: "#2E7D52", color: "#E8F5EE" }}
              >
                Entrar
              </button>

              <p className="text-center text-xs text-muted-foreground">
                Não tem conta?{" "}
                <button type="button" onClick={() => switchMode("register")} className="text-[#4CAF7A] hover:underline">
                  Criar conta gratuita
                </button>
              </p>
            </form>
          )}

          {/* ── Register Form ── */}
          {mode === "register" && (
            <form onSubmit={handleRegister} className="space-y-5">
              <div>
                <p className="text-xl text-foreground mb-1" style={{ fontFamily: "DM Serif Display, serif" }}>
                  Crie sua conta
                </p>
                <p className="text-xs text-muted-foreground">Comece a investir com inteligência</p>
              </div>

              <div className="space-y-3">
                {/* Name */}
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Nome completo"
                    className="w-full bg-secondary border border-border rounded-lg pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-[#2E7D52] transition-colors"
                  />
                </div>
                {/* Email */}
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full bg-secondary border border-border rounded-lg pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-[#2E7D52] transition-colors"
                  />
                </div>
                {/* Passwords */}
                <PasswordInput value={regPassword} onChange={setRegPassword} placeholder="Senha (mín. 6 caracteres)" />
                <PasswordInput value={regConfirm} onChange={setRegConfirm} placeholder="Confirmar senha" />
              </div>

              {/* Investor profile */}
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground uppercase tracking-widest">Perfil de Investidor</p>
                <div className="space-y-2">
                  {INVESTOR_PROFILES.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setRegProfile(p.id)}
                      className={`w-full flex items-start gap-3 px-4 py-3 rounded-lg border text-left transition-all ${
                        regProfile === p.id
                          ? "border-[#2E7D52]"
                          : "border-border hover:border-[#2E7D52]/40"
                      }`}
                      style={regProfile === p.id ? { background: "#162216" } : { background: "#0D110D" }}
                    >
                      <div
                        className="w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors"
                        style={regProfile === p.id ? { borderColor: "#2E7D52", background: "#2E7D52" } : { borderColor: "#5A7A5A" }}
                      >
                        {regProfile === p.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-foreground">{p.label}</p>
                        <p className="text-[10px] text-muted-foreground">{p.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2.5">
                  <AlertTriangle size={13} />
                  {error}
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 text-xs text-[#4CAF7A] bg-[#4CAF7A]/10 border border-[#4CAF7A]/20 rounded-lg px-3 py-2.5">
                  <CheckCircle2 size={13} />
                  {success}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg text-sm font-medium transition-all hover:opacity-90 active:scale-[0.99] flex items-center justify-center gap-2"
                style={{ background: "#2E7D52", color: "#E8F5EE" }}
              >
                <UserPlus size={15} />
                Criar conta
              </button>

              <p className="text-center text-xs text-muted-foreground">
                Já tem conta?{" "}
                <button type="button" onClick={() => switchMode("login")} className="text-[#4CAF7A] hover:underline">
                  Entrar
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
const screenMeta: Record<Screen, { title: string; subtitle: string }> = {
  dashboard: { title: "Dashboard", subtitle: "Visão geral do seu patrimônio" },
  portfolio: { title: "Portfólio", subtitle: "Composição e desempenho dos seus ativos" },
  chat: { title: "Assessor IA", subtitle: "Converse com seu assessor de investimentos" },
  recommendations: { title: "Recomendações", subtitle: "Sugestões personalizadas pela inteligência artificial" },
};

function restoreSession(): LocalUser | null {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || "null"); } catch { return null; }
}

export default function App() {
  const [user, setUser] = useState<LocalUser | null>(restoreSession);
  const [screen, setScreen] = useState<Screen>("dashboard");
  const meta = screenMeta[screen];

  function handleLogout() {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
    setScreen("dashboard");
  }

  if (!user) return <AuthScreen onAuth={setUser} />;

  const initials = user.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const profileLabel = INVESTOR_PROFILES.find((p) => p.id === user.profile)?.label ?? user.profile;

  return (
    <div className="size-full flex bg-background" style={{ fontFamily: "Inter, sans-serif" }}>
      <Sidebar active={screen} onNavigate={setScreen} userInitials={initials} userName={user.name} userProfile={profileLabel} onLogout={handleLogout} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title={meta.title} subtitle={meta.subtitle} />
        {screen === "dashboard" && <DashboardScreen />}
        {screen === "portfolio" && <PortfolioScreen />}
        {screen === "chat" && <ChatScreen />}
        {screen === "recommendations" && <RecommendationsScreen />}
      </div>
    </div>
  );
}
