import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Trash2,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  FileText,
  BookOpenCheck,
  AlertTriangle,
} from 'lucide-react';
import { useStore } from '../store';
import { DOMAINS, LICENSES, type Dataset, type DatasetField, type FieldType } from '../types';

const steps = [
  { key: 'basic', label: '基本信息', icon: FileText },
  { key: 'fields', label: '字段定义', icon: FileText },
  { key: 'citation', label: '引用格式', icon: BookOpenCheck },
  { key: 'restrictions', label: '使用限制', icon: AlertTriangle },
  { key: 'preview', label: '提交预览', icon: CheckCircle2 },
];

const fieldTypes: FieldType[] = ['string', 'number', 'boolean', 'date', 'array', 'object'];

export function SubmitDatasetPage() {
  const navigate = useNavigate();
  const { currentUser, submitDataset } = useStore();
  const [step, setStep] = useState(0);

  const [name, setName] = useState('');
  const [authorsText, setAuthorsText] = useState('');
  const [organization, setOrganization] = useState('');
  const [collectionDate, setCollectionDate] = useState('');
  const [license, setLicense] = useState(LICENSES[0]);
  const [domain, setDomain] = useState(DOMAINS[0]);
  const [description, setDescription] = useState('');

  const [fields, setFields] = useState<DatasetField[]>([
    { name: '', type: 'string', description: '', example: '' },
  ]);

  const [bibtex, setBibtex] = useState('');
  const [apa, setApa] = useState('');
  const [mla, setMla] = useState('');

  const [restriction1, setRestriction1] = useState('使用时必须引用原始数据集');
  const [restriction2, setRestriction2] = useState('');
  const [restriction3, setRestriction3] = useState('');
  const [customRestrictions, setCustomRestrictions] = useState<string[]>([]);

  const [error, setError] = useState('');

  if (!currentUser || (currentUser.role !== 'researcher' && currentUser.role !== 'admin')) {
    return (
      <div className="container py-16 animate-fade-in">
        <div className="max-w-xl mx-auto card p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-warning-500 mx-auto mb-4" />
          <h2 className="font-serif text-xl font-semibold text-academic-900 mb-2">
            权限不足
          </h2>
          <p className="text-academic-600 mb-5">
            提交数据集需要研究人员或管理员账号，请先登录。
          </p>
          <button onClick={() => navigate('/login')} className="btn-primary">
            前往登录
          </button>
        </div>
      </div>
    );
  }

  const addField = () =>
    setFields([...fields, { name: '', type: 'string', description: '', example: '' }]);
  const removeField = (idx: number) =>
    setFields(fields.filter((_, i) => i !== idx));
  const updateField = (idx: number, patch: Partial<DatasetField>) =>
    setFields(fields.map((f, i) => (i === idx ? { ...f, ...patch } : f)));

  const addCustomRestriction = () => setCustomRestrictions([...customRestrictions, '']);
  const updateCustom = (idx: number, v: string) =>
    setCustomRestrictions(customRestrictions.map((r, i) => (i === idx ? v : r)));
  const removeCustom = (idx: number) =>
    setCustomRestrictions(customRestrictions.filter((_, i) => i !== idx));

  const canNext = () => {
    switch (step) {
      case 0:
        return (
          name.trim().length > 2 &&
          authorsText.trim().length > 0 &&
          description.trim().length > 10 &&
          collectionDate
        );
      case 1:
        return fields.some((f) => f.name.trim() && f.description.trim());
      case 2:
        return bibtex.trim().length > 5 && apa.trim().length > 5 && mla.trim().length > 5;
      default:
        return true;
    }
  };

  const handleSubmit = () => {
    if (!canNext()) {
      setError('请先完善必填信息');
      return;
    }
    const usageRestrictions = [restriction1, restriction2, restriction3, ...customRestrictions]
      .map((s) => s.trim())
      .filter(Boolean);

    const dataset: Dataset = {
      id: `ds-${Date.now().toString(36)}`,
      name: name.trim(),
      authors: authorsText
        .split(/[,，;；]/)
        .map((a) => a.trim())
        .filter(Boolean),
      organization: organization.trim() || undefined,
      collectionDate,
      publishedDate: new Date().toISOString().slice(0, 10),
      license,
      domain,
      description: description.trim(),
      fields: fields.filter((f) => f.name.trim() && f.description.trim()),
      citation: { bibtex: bibtex.trim(), apa: apa.trim(), mla: mla.trim() },
      usageRestrictions,
      status: 'pending',
      downloads: 0,
      favorites: 0,
      revisions: [],
      submittedBy: currentUser.id,
    };
    submitDataset(dataset);
    navigate('/user/submissions');
  };

  const StepNav = () => (
    <div className="flex items-center justify-between mb-8 overflow-x-auto pb-2">
      {steps.map((s, idx) => {
        const Icon = s.icon;
        const active = idx === step;
        const done = idx < step;
        return (
          <div key={s.key} className="flex items-center shrink-0">
            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                active
                  ? 'bg-academic-800 text-white shadow-sm'
                  : done
                  ? 'text-success-700 bg-success-50'
                  : 'text-academic-400'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                  active
                    ? 'bg-white text-academic-800'
                    : done
                    ? 'bg-success-700 text-white'
                    : 'bg-academic-100 text-academic-500'
                }`}
              >
                {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
              </div>
              <span className="text-sm font-medium whitespace-nowrap">{s.label}</span>
              <Icon className="w-4 h-4" />
            </div>
            {idx < steps.length - 1 && (
              <div
                className={`w-8 h-0.5 mx-2 ${
                  done ? 'bg-success-400' : 'bg-academic-100'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="container py-8 animate-fade-in">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="font-serif text-2xl md:text-3xl font-semibold text-academic-900 mb-1">
            提交数据集
          </h1>
          <p className="text-sm text-academic-500">
            请按步骤完善数据集信息，提交后将由管理员审核
          </p>
        </div>

        <StepNav />

        <div className="card p-6 md:p-8">
          {step === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fade-in">
              <div className="md:col-span-2">
                <label className="label">数据集名称 *</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input"
                  placeholder="例如：ImageNet-1K 图像分类数据集"
                />
              </div>
              <div className="md:col-span-2">
                <label className="label">作者列表 * (多个作者用逗号分隔)</label>
                <input
                  value={authorsText}
                  onChange={(e) => setAuthorsText(e.target.value)}
                  className="input"
                  placeholder="例如：张伟, 李娜, John Smith"
                />
              </div>
              <div>
                <label className="label">所属机构</label>
                <input
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="input"
                  placeholder="例如：清华大学"
                />
              </div>
              <div>
                <label className="label">数据采集时间 *</label>
                <input
                  type="date"
                  value={collectionDate}
                  onChange={(e) => setCollectionDate(e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="label">研究领域 *</label>
                <select
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="input"
                >
                  {DOMAINS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">数据许可证 *</label>
                <select
                  value={license}
                  onChange={(e) => setLicense(e.target.value)}
                  className="input"
                >
                  {LICENSES.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="label">数据集描述 *</label>
                <textarea
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input resize-none"
                  placeholder="简要描述数据集内容、规模、应用场景等…"
                />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h3 className="subsection-title !mb-0">字段定义</h3>
                <button onClick={addField} className="btn-outline !py-1.5 !px-3 text-sm">
                  <Plus className="w-4 h-4" /> 添加字段
                </button>
              </div>
              <div className="space-y-3">
                {fields.map((f, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-12 gap-3 items-start p-4 rounded-lg border border-academic-100 bg-academic-50/40"
                  >
                    <div className="col-span-12 sm:col-span-3">
                      <label className="label !text-xs">字段名</label>
                      <input
                        value={f.name}
                        onChange={(e) => updateField(idx, { name: e.target.value })}
                        className="input !py-2"
                        placeholder="field_name"
                      />
                    </div>
                    <div className="col-span-6 sm:col-span-2">
                      <label className="label !text-xs">类型</label>
                      <select
                        value={f.type}
                        onChange={(e) =>
                          updateField(idx, { type: e.target.value as FieldType })
                        }
                        className="input !py-2"
                      >
                        {fieldTypes.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-12 sm:col-span-5">
                      <label className="label !text-xs">描述</label>
                      <input
                        value={f.description}
                        onChange={(e) => updateField(idx, { description: e.target.value })}
                        className="input !py-2"
                        placeholder="字段说明"
                      />
                    </div>
                    <div className="col-span-10 sm:col-span-1">
                      <label className="label !text-xs">示例</label>
                      <input
                        value={f.example}
                        onChange={(e) => updateField(idx, { example: e.target.value })}
                        className="input !py-2"
                        placeholder="123"
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-1 flex sm:justify-end sm:items-end h-full">
                      <button
                        onClick={() => removeField(idx)}
                        disabled={fields.length === 1}
                        className="btn-ghost !p-2 text-danger-600 hover:text-danger-700 hover:bg-danger-50 disabled:opacity-40"
                        aria-label="删除字段"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <label className="label">BibTeX *</label>
                <textarea
                  rows={6}
                  value={bibtex}
                  onChange={(e) => setBibtex(e.target.value)}
                  className="input font-mono text-xs resize-none"
                  placeholder="@article{author2025title,..."
                />
              </div>
              <div>
                <label className="label">APA 格式 *</label>
                <textarea
                  rows={3}
                  value={apa}
                  onChange={(e) => setApa(e.target.value)}
                  className="input resize-none"
                  placeholder="Author, A. A. (2025). Title..."
                />
              </div>
              <div>
                <label className="label">MLA 格式 *</label>
                <textarea
                  rows={3}
                  value={mla}
                  onChange={(e) => setMla(e.target.value)}
                  className="input resize-none"
                  placeholder="Author, Name. Title. Publisher, 2025."
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="subsection-title">使用限制条款</h3>
              <p className="text-sm text-academic-500 -mt-2 mb-4">
                下载用户将在下载前看到以下条款，请确保清晰明确。
              </p>
              {[restriction1, restriction2, restriction3].map((v, i) => (
                <div key={i}>
                  <label className="label">条款 {i + 1}{i === 0 && ' *'}</label>
                  <input
                    value={v}
                    onChange={(e) =>
                      i === 0
                        ? setRestriction1(e.target.value)
                        : i === 1
                        ? setRestriction2(e.target.value)
                        : setRestriction3(e.target.value)
                    }
                    className="input"
                    placeholder={i === 0 ? '使用时必须引用原始数据集' : '可选条款'}
                  />
                </div>
              ))}
              {customRestrictions.map((v, i) => (
                <div key={`c-${i}`} className="flex items-end gap-2">
                  <div className="flex-1">
                    <label className="label">附加条款 {i + 1}</label>
                    <input
                      value={v}
                      onChange={(e) => updateCustom(i, e.target.value)}
                      className="input"
                      placeholder="自定义使用限制"
                    />
                  </div>
                  <button
                    onClick={() => removeCustom(i)}
                    className="btn-ghost !p-2 text-danger-600 hover:text-danger-700 hover:bg-danger-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button onClick={addCustomRestriction} className="btn-outline !py-1.5 !px-3 text-sm">
                <Plus className="w-4 h-4" /> 添加自定义条款
              </button>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="subsection-title">提交预览</h3>
              <div className="rounded-xl border border-academic-100 overflow-hidden">
                <div className="bg-academic-50 px-5 py-3 border-b border-academic-100">
                  <div className="font-serif text-lg font-semibold text-academic-900">
                    {name || '（未填写名称）'}
                  </div>
                  <div className="text-sm text-academic-600 mt-1">
                    {authorsText || '—'} · {organization || '—'} · {domain}
                  </div>
                </div>
                <div className="p-5 space-y-4 text-sm">
                  <div>
                    <div className="text-xs text-academic-500 mb-1">描述</div>
                    <div className="text-academic-700 whitespace-pre-wrap">
                      {description || '—'}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="text-xs text-academic-500 mb-1">采集时间</div>
                      <div className="text-academic-800">{collectionDate || '—'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-academic-500 mb-1">许可证</div>
                      <div className="text-academic-800">{license}</div>
                    </div>
                    <div>
                      <div className="text-xs text-academic-500 mb-1">字段数</div>
                      <div className="text-academic-800">
                        {fields.filter((f) => f.name.trim() && f.description.trim()).length}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {error && (
                <div className="rounded-lg border border-danger-200 bg-danger-50 text-danger-700 text-sm px-4 py-3">
                  {error}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-academic-100">
            <button
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
              className="btn-outline"
            >
              <ChevronLeft className="w-4 h-4" /> 上一步
            </button>
            {step < steps.length - 1 ? (
              <button
                onClick={() => {
                  if (!canNext()) {
                    setError('请完善当前步骤的必填信息');
                    return;
                  }
                  setError('');
                  setStep(step + 1);
                }}
                className="btn-primary"
              >
                下一步 <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={handleSubmit} className="btn-success">
                <CheckCircle2 className="w-4 h-4" /> 提交审核
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
