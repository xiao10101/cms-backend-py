import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, History, Save, Send } from "lucide-react";
import { createContent, getContent, submitReview, updateContent } from "@/api/content";
import { getCategoryTree } from "@/api/category";
import { getTags } from "@/api/tag";
import type { Content, ContentTranslation } from "@/types";
import { LOCALES } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Tabs } from "@/components/ui/Tabs";
import { Badge } from "@/components/ui/Badge";
import { RichTextEditor } from "@/components/RichTextEditor";
import { VersionModal } from "@/components/VersionModal";
import { cn } from "@/lib/cn";

interface EditorForm {
  categoryId: string;
  tags: string[];
  translations: ContentTranslation[];
}

export default function ContentEdit() {
  const { id } = useParams();
  const isNew = !id || id === "new";
  return <Editor key={id} contentId={isNew ? null : id} isNew={isNew} />;
}

function Editor({ contentId, isNew }: { contentId: string | null; isNew: boolean }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeLocale, setActiveLocale] = useState(LOCALES[0].code);
  const [versionOpen, setVersionOpen] = useState(false);

  const [form, setForm] = useState<EditorForm>({
    categoryId: "",
    tags: [],
    translations: LOCALES.map((l) => ({ locale: l.code, title: "", slug: "", summary: "", body: "" })),
  });

  const { data: existing } = useQuery({
    queryKey: ["content", contentId],
    queryFn: () => getContent(contentId!),
    enabled: !!contentId,
  });
  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: getCategoryTree });
  const { data: tags } = useQuery({ queryKey: ["tags"], queryFn: getTags });

  useEffect(() => {
    if (existing) {
      setForm({ categoryId: existing.categoryId, tags: existing.tags, translations: existing.translations });
      setActiveLocale(existing.translations[0]?.locale || LOCALES[0].code);
    }
  }, [existing]);

  const save = useMutation({
    mutationFn: () =>
      isNew ? createContent(form) : updateContent(contentId!, form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contents"] });
      navigate("/content");
    },
  });

  const submit = useMutation({
    mutationFn: async () => {
      const payload = { ...form, status: "draft" as const };
      const saved = isNew ? await createContent(payload) : await updateContent(contentId!, payload);
      await submitReview(saved.id);
      return saved;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contents"] });
      navigate("/content");
    },
  });

  function updateTranslation(locale: string, patch: Partial<ContentTranslation>) {
    setForm((f) => ({
      ...f,
      translations: f.translations.map((t) => (t.locale === locale ? { ...t, ...patch } : t)),
    }));
  }

  function toggleTag(name: string) {
    setForm((f) => ({
      ...f,
      tags: f.tags.includes(name) ? f.tags.filter((x) => x !== name) : [...f.tags, name],
    }));
  }

  const active = form.translations.find((t) => t.locale === activeLocale) || form.translations[0];

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/content")} className="cursor-pointer rounded-md p-1.5 text-gray-500 hover:bg-gray-100">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">{isNew ? "新建内容" : "编辑内容"}</h1>
          {existing && (
            <span className="text-sm text-gray-400">v{existing.version} · {existing.authorName}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!isNew && (
            <Button variant="outline" icon={<History className="h-4 w-4" />} onClick={() => setVersionOpen(true)}>
              版本历史
            </Button>
          )}
          <Button variant="outline" icon={<Save className="h-4 w-4" />} loading={save.isPending} onClick={() => save.mutate()}>
            保存草稿
          </Button>
          <Button icon={<Send className="h-4 w-4" />} loading={submit.isPending} onClick={() => submit.mutate()}>
            提交审核
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_280px]">
        <div className="space-y-4">
          <div className="card p-5">
            <div className="mb-4">
              <Tabs
                items={LOCALES.map((l) => ({
                  key: l.code,
                  label: (
                    <span className="flex items-center gap-1.5">
                      {l.label}
                      {form.translations.find((t) => t.locale === l.code)?.title && <span className="h-1.5 w-1.5 rounded-full bg-success" />}
                    </span>
                  ),
                }))}
                activeKey={activeLocale}
                onChange={setActiveLocale}
              />
            </div>

            <div key={activeLocale} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm text-gray-600">标题</label>
                <Input
                  value={active?.title || ""}
                  onChange={(e) => updateTranslation(activeLocale, { title: e.target.value })}
                  placeholder="请输入标题"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm text-gray-600">Slug</label>
                  <Input
                    value={active?.slug || ""}
                    onChange={(e) => updateTranslation(activeLocale, { slug: e.target.value })}
                    placeholder="url-slug"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm text-gray-600">摘要</label>
                  <Input
                    value={active?.summary || ""}
                    onChange={(e) => updateTranslation(activeLocale, { summary: e.target.value })}
                    placeholder="简短摘要"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-gray-600">正文</label>
                <RichTextEditor
                  value={active?.body || ""}
                  onChange={(html) => updateTranslation(activeLocale, { body: html })}
                />
              </div>

              <div className="rounded-lg border border-gray-100 bg-surface-muted/50 p-4">
                <div className="mb-3 text-xs font-medium text-gray-400">SEO 设置（{activeLocale}）</div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-xs text-gray-500">SEO 标题</label>
                    <Input
                      value={active?.seoTitle || ""}
                      onChange={(e) => updateTranslation(activeLocale, { seoTitle: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs text-gray-500">SEO 描述</label>
                    <Textarea
                      rows={2}
                      value={active?.seoDescription || ""}
                      onChange={(e) => updateTranslation(activeLocale, { seoDescription: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <div className="mb-4 text-sm font-semibold text-gray-700">发布设置</div>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm text-gray-600">所属栏目</label>
                <Select
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  options={[{ label: "请选择栏目", value: "" }, ...(categories || []).map((c) => ({ label: c.name, value: c.id }))]}
                  className="w-full"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-gray-600">标签</label>
                <div className="flex flex-wrap gap-2">
                  {(tags || []).map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.name)}
                      className={cn(
                        "cursor-pointer rounded-md px-2.5 py-1 text-xs transition-colors",
                        form.tags.includes(tag.name)
                          ? "text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      )}
                      style={form.tags.includes(tag.name) ? { background: tag.color } : undefined}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <div className="mb-3 text-sm font-semibold text-gray-700">已启用语言</div>
            <div className="flex flex-wrap gap-2">
              {form.translations.map((t) => (
                <Badge key={t.locale} color={t.title ? "blue" : "gray"}>
                  {LOCALES.find((l) => l.code === t.locale)?.label || t.locale}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      {existing && (
        <VersionModal
          open={versionOpen}
          contentId={existing.id}
          currentBody={existing.translations[0]?.body || ""}
          onClose={() => setVersionOpen(false)}
          onRolledBack={() => {
            setVersionOpen(false);
            queryClient.invalidateQueries({ queryKey: ["content", contentId] });
          }}
        />
      )}
    </div>
  );
}
