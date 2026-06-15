import { Link, useNavigate } from 'react-router-dom';
import {
  Database,
  Download,
  Heart,
  Users,
  Search,
  ArrowRight,
  BookOpenCheck,
  Quote,
  ShieldCheck,
  BellRing,
  FlaskConical,
  Activity,
  Leaf,
  Telescope,
  UsersRound,
  Dna,
  Atom,
  TrendingUp,
} from 'lucide-react';
import { useStore } from '../store';
import { DatasetCard } from '../components/DatasetCard';
import { DOMAINS } from '../types';

export function HomePage() {
  const navigate = useNavigate();
  const { getApprovedDatasets, datasets } = useStore();
  const approved = getApprovedDatasets({ sortBy: 'newest' });
  const popular = getApprovedDatasets({ sortBy: 'downloads' }).slice(0, 6);
  const latest = approved.slice(0, 6);

  const totalDownloads = datasets.reduce((s, d) => s + d.downloads, 0);
  const totalFavorites = datasets.reduce((s, d) => s + d.favorites, 0);

  const domainIcons: Record<string, typeof Database> = {
    计算机科学: FlaskConical,
    医学与健康: Activity,
    环境科学: Leaf,
    天文学与天体物理: Telescope,
    社会科学: UsersRound,
    生物学: Dna,
    物理学: Atom,
    经济学: TrendingUp,
  };

  const domainStats = DOMAINS.slice(0, 8).map((d) => ({
    name: d,
    count: approved.filter((x) => x.domain === d).length,
    Icon: domainIcons[d] || Database,
  }));

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const q = String(fd.get('q') || '');
    navigate(`/datasets?keyword=${encodeURIComponent(q)}`);
  };

  return (
    <div className="animate-fade-in">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-academic-900 via-academic-800 to-academic-700" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 30%, rgba(32,201,151,0.35), transparent 40%), radial-gradient(circle at 80% 70%, rgba(245,158,11,0.25), transparent 45%)',
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
            backgroundSize: '44px 44px',
          }}
        />
        <div className="relative container py-20 md:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur text-white/90 text-xs font-medium mb-6 border border-white/10">
              <BookOpenCheck className="w-3.5 h-3.5" />
              推动学术数据可追溯 · 规范引用 · 开放共享
            </div>
            <h1 className="font-serif text-4xl md:text-6xl font-bold text-white leading-tight text-balance mb-6 animate-slide-up">
              发现、引用、共享
              <br />
              <span className="bg-gradient-to-r from-success-300 to-warning-300 bg-clip-text text-transparent">
                每一个科研数据集
              </span>
            </h1>
            <p className="text-academic-100 text-lg md:text-xl leading-relaxed mb-8 max-w-2xl animate-slide-up" style={{ animationDelay: '60ms' }}>
              DataCite Hub 收录跨学科科研数据集，提供规范的引用格式、清晰的使用限制和完整的版本追踪，助力您的研究。
            </p>

            <form
              onSubmit={handleSearch}
              className="relative flex items-center max-w-2xl mb-10 animate-slide-up"
              style={{ animationDelay: '120ms' }}
            >
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-academic-400" />
              <input
                name="q"
                type="text"
                placeholder="搜索数据集名称、作者或关键词…"
                className="w-full pl-12 pr-32 py-4 rounded-xl bg-white text-academic-900 placeholder:text-academic-400 focus:outline-none focus:ring-4 focus:ring-success-400/40 shadow-xl shadow-academic-900/30"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 btn-primary !py-2.5 px-5"
              >
                搜索
              </button>
            </form>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl animate-slide-up" style={{ animationDelay: '180ms' }}>
              {[
                { icon: Database, label: '收录数据集', value: approved.length },
                { icon: Download, label: '累计下载', value: totalDownloads.toLocaleString() },
                { icon: Heart, label: '收藏量', value: totalFavorites.toLocaleString() },
                { icon: Users, label: '研究领域', value: new Set(approved.map((d) => d.domain)).size },
              ].map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 px-5 py-4 hover:bg-white/10 transition-colors"
                >
                  <Icon className="w-5 h-5 text-success-300 mb-2" />
                  <div className="text-2xl md:text-3xl font-serif font-bold text-white">
                    {value}
                  </div>
                  <div className="text-xs text-academic-200 mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container py-16">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="section-title mb-1">最新数据集</h2>
            <p className="text-sm text-academic-500">近期通过审核并公开发布的数据集</p>
          </div>
          <Link
            to="/datasets?sort=newest"
            className="inline-flex items-center gap-1 text-sm font-medium text-academic-700 hover:text-academic-900 transition-colors"
          >
            查看全部 <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {latest.map((d) => (
            <DatasetCard key={d.id} dataset={d} />
          ))}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="section-title mb-2">按研究领域浏览</h2>
            <p className="text-sm text-academic-500">覆盖计算机、医学、环境、天文等主流学科领域</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {domainStats.map(({ name, count, Icon }) => (
              <Link
                key={name}
                to={`/datasets?domain=${encodeURIComponent(name)}`}
                className="group relative overflow-hidden rounded-xl p-5 border border-academic-100 bg-gradient-to-br from-white to-academic-50 hover:shadow-card-hover hover:-translate-y-0.5 transition-all"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-academic-800 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="text-2xl font-serif font-bold text-academic-900">
                    {count}
                  </div>
                </div>
                <div className="text-sm font-medium text-academic-700 group-hover:text-academic-900">
                  {name}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="container py-16">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="section-title mb-1">热门下载</h2>
            <p className="text-sm text-academic-500">被研究人员广泛使用的高影响力数据集</p>
          </div>
          <Link
            to="/datasets?sort=downloads"
            className="inline-flex items-center gap-1 text-sm font-medium text-academic-700 hover:text-academic-900 transition-colors"
          >
            查看全部 <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {popular.map((d) => (
            <DatasetCard key={d.id} dataset={d} compact />
          ))}
        </div>
      </section>

      <section className="container pb-20">
        <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-academic-50 to-white border border-academic-100">
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-academic-100">
            {[
              {
                icon: Quote,
                title: '规范的引用格式',
                desc: '提供 BibTeX、APA、MLA 等多种标准引用格式，一键复制到您的论文参考文献中。',
              },
              {
                icon: ShieldCheck,
                title: '清晰的使用限制',
                desc: '每个数据集在下载前明确展示许可证与使用条款，确保您合规使用。',
              },
              {
                icon: BellRing,
                title: '版本追踪通知',
                desc: '收藏的数据集在修订或撤稿时第一时间通知您，保障研究可靠性。',
              },
              {
                icon: BookOpenCheck,
                title: '严格的审核流程',
                desc: '所有提交的数据集需经管理员审核，确保元数据质量与学术规范性。',
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="p-8 flex gap-4">
                <div className="shrink-0 w-11 h-11 rounded-xl bg-academic-800 text-white flex items-center justify-center">
                  <Icon className="w-5.5 h-5.5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-semibold text-academic-900 mb-1.5">
                    {title}
                  </h3>
                  <p className="text-sm text-academic-600 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
