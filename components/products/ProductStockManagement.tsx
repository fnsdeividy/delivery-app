"use client";

import { useMemo, useState } from "react";

interface ProductStockManagementProps {
  formData: {
    initialStock?: number;
    minStock?: number;
    maxStock?: number;
    stockAlerts?: boolean;
    autoRestock?: boolean;
    unit?: string;
    stockType?: string; // 'unit' | 'box' | 'infinite'
    volume?: number;
    volumeUnit?: string; // 'ml' | 'l'
    returnable?: boolean;
    temperature?: string; // 'cold' | 'hot' | 'room'
  };
  onFormDataChange: (
    updates: Partial<ProductStockManagementProps["formData"]>
  ) => void;
}

/**
 * Botão minimalista com aparência de "ícone" clicável.
 * Usa apenas Tailwind, sem libs externas.
 */
function IconButton({
  label,
  ariaLabel,
  onClick,
  disabled,
}: {
  label: string;
  ariaLabel: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-md border text-sm transition
        ${
          disabled
            ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 active:scale-95"
        }`}
    >
      {label}
    </button>
  );
}

/**
 * Campo numérico com steppers, atalhos e validações.
 */
function NumberField({
  label,
  value,
  min = 0,
  step = 1,
  placeholder = "0",
  disabled,
  onChange,
  onBlur,
  suffix,
  quickAdds,
}: {
  label: string;
  value?: number;
  min?: number;
  step?: number;
  placeholder?: string;
  disabled?: boolean;
  onChange: (v: number | undefined) => void;
  onBlur?: () => void;
  suffix?: string;
  quickAdds?: number[];
}) {
  const parsed = Number.isFinite(value as number)
    ? (value as number)
    : undefined;

  const inc = () => {
    if (disabled) return;
    const next = (parsed ?? 0) + step;
    onChange(next < min ? min : next);
  };

  const dec = () => {
    if (disabled) return;
    const next = (parsed ?? 0) - step;
    onChange(next < min ? min : next);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>

      <div
        className={`flex rounded-md border ${
          disabled ? "bg-gray-50 border-gray-200" : "border-gray-300"
        } focus-within:ring-2 focus-within:ring-purple-500`}
      >
        <IconButton
          ariaLabel={`Diminuir ${label}`}
          label="−"
          onClick={dec}
          disabled={disabled}
        />
        <input
          type="number"
          inputMode="numeric"
          min={min}
          step={step}
          value={parsed ?? ""}
          onChange={(e) => {
            const raw = e.target.value;
            if (raw === "") return onChange(undefined);
            const n = Number(raw);
            if (Number.isNaN(n)) return;
            onChange(n < min ? min : n);
          }}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={placeholder}
          className="w-full px-3 py-2 outline-none text-gray-900 disabled:bg-gray-50"
          aria-label={label}
        />
        {suffix ? (
          <span
            className={`px-2 py-2 text-sm ${
              disabled ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {suffix}
          </span>
        ) : null}
        <IconButton
          ariaLabel={`Aumentar ${label}`}
          label="+"
          onClick={inc}
          disabled={disabled}
        />
      </div>

      {quickAdds && quickAdds.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {quickAdds.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => onChange((parsed ?? 0) + q)}
              disabled={disabled}
              className={`px-3 py-1.5 text-xs rounded-md border transition
                ${
                  disabled
                    ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              aria-label={`Adicionar rapidamente ${q} ao ${label}`}
            >
              +{q}
            </button>
          ))}
          {!disabled && parsed && parsed > 0 ? (
            <button
              type="button"
              onClick={() => onChange(0)}
              className="px-3 py-1.5 text-xs rounded-md border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition"
            >
              Zerar
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/**
 * Chip simples (toggle) para seleção de opções.
 */
function Chip({
  active,
  label,
  onClick,
  ariaLabel,
}: {
  active?: boolean;
  label: string;
  onClick: () => void;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel ?? label}
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full border text-sm transition
        ${
          active
            ? "bg-purple-600 text-white border-purple-600"
            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
        }`}
    >
      {label}
    </button>
  );
}

export function ProductStockManagement({
  formData,
  onFormDataChange,
}: ProductStockManagementProps) {
  const [showAdvanced, setShowAdvanced] = useState(true);

  // ======= Validações =======
  const stockErrors = useMemo(() => {
    const errors: string[] = [];
    const { initialStock, minStock, maxStock, stockType } = formData;

    if (stockType !== "infinite") {
      if (minStock != null && initialStock != null && minStock > initialStock) {
        errors.push("Estoque mínimo não pode ser maior que o estoque inicial.");
      }
      if (maxStock != null && initialStock != null && maxStock < initialStock) {
        errors.push("Estoque máximo não pode ser menor que o estoque inicial.");
      }
      if (minStock != null && maxStock != null && minStock > maxStock) {
        errors.push("Estoque mínimo não pode ser maior que o estoque máximo.");
      }
    }
    return errors;
  }, [formData]);

  const isInfinite = formData.stockType === "infinite";

  // ======= Cálculos / status =======
  const stockStatus = useMemo(() => {
    if (isInfinite) {
      return {
        label: "Estoque Infinito",
        tone: "bg-emerald-50 text-emerald-700 border-emerald-200",
      };
    }
    const s = formData.initialStock ?? 0;
    const min = formData.minStock ?? undefined;
    const max = formData.maxStock ?? undefined;

    if (s <= 0)
      return {
        label: "Sem estoque",
        tone: "bg-red-50 text-red-700 border-red-200",
      };
    if (min != null && s <= min)
      return {
        label: "Atenção: estoque baixo",
        tone: "bg-amber-50 text-amber-700 border-amber-200",
      };
    if (max != null && s >= max)
      return {
        label: "Estoque no limite",
        tone: "bg-blue-50 text-blue-700 border-blue-200",
      };
    return {
      label: "Estoque saudável",
      tone: "bg-emerald-50 text-emerald-700 border-emerald-200",
    };
  }, [formData.initialStock, formData.minStock, formData.maxStock, isInfinite]);

  // ======= Ações inteligentes =======
  const setSmartBounds = (percentMin = 20, percentMax = 200) => {
    if (isInfinite) return;
    const base = formData.initialStock ?? 0;
    const min = Math.max(0, Math.floor((base * percentMin) / 100));
    const max = Math.max(min, Math.floor((base * percentMax) / 100));
    onFormDataChange({ minStock: min, maxStock: max });
  };

  const setUnit = (u: string) => onFormDataChange({ unit: u });
  const setVolumeUnit = (vu: string) => onFormDataChange({ volumeUnit: vu });

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      {/* Header com status + ações rápidas */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Controle de Estoque
        </h2>

        <div className="flex flex-wrap gap-2">
          <span
            className={`inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm ${stockStatus.tone}`}
          >
            <span aria-hidden>📦</span>
            {stockStatus.label}
          </span>

          {/* Ações “ícone” que são botões */}
          {!isInfinite && (
            <>
              <button
                type="button"
                onClick={() => setSmartBounds(20, 200)}
                className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 transition"
              >
                <span aria-hidden>✨</span> Sugerir min/max (20% / 200%)
              </button>
              <button
                type="button"
                onClick={() =>
                  onFormDataChange({
                    minStock: 0,
                    maxStock: Math.max(10, (formData.initialStock ?? 0) || 10),
                  })
                }
                className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 transition"
              >
                <span aria-hidden>⚡</span> Min 0 / Max auto
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => setShowAdvanced((s) => !s)}
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 transition"
          >
            <span aria-hidden>{showAdvanced ? "➖" : "➕"}</span>
            {showAdvanced ? "Ocultar avançado" : "Mostrar avançado"}
          </button>
        </div>
      </div>

      {/* Tipo de estoque em chips (botões) */}
      <div className="mb-4">
        <p className="text-sm font-medium text-gray-700 mb-2">
          Tipo de Estoque
        </p>
        <div className="flex flex-wrap gap-2">
          <Chip
            label="Por Unidade"
            active={(formData.stockType ?? "unit") === "unit"}
            onClick={() => onFormDataChange({ stockType: "unit" })}
          />
          <Chip
            label="Por Caixa"
            active={formData.stockType === "box"}
            onClick={() => onFormDataChange({ stockType: "box" })}
          />
          <Chip
            label="Infinito"
            active={formData.stockType === "infinite"}
            onClick={() => onFormDataChange({ stockType: "infinite" })}
          />
        </div>
        {isInfinite ? (
          <p className="mt-2 text-sm text-gray-600">
            Estoque infinito habilitado — campos de quantidade ficam
            desabilitados.
          </p>
        ) : null}
      </div>

      {/* Quantidades com steppers e atalhos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <NumberField
          label="Estoque Inicial"
          value={formData.initialStock}
          min={0}
          step={1}
          quickAdds={[10, 50, 100]}
          disabled={isInfinite}
          onChange={(v) => onFormDataChange({ initialStock: v })}
          onBlur={() => {
            // se já tiver min/max, revalida relação
            // (mantemos simples; validação principal está no stockErrors)
          }}
        />

        <NumberField
          label="Estoque Mínimo"
          value={formData.minStock}
          min={0}
          step={1}
          disabled={isInfinite}
          onChange={(v) => onFormDataChange({ minStock: v })}
        />

        <NumberField
          label="Estoque Máximo"
          value={formData.maxStock}
          min={0}
          step={1}
          disabled={isInfinite}
          onChange={(v) => onFormDataChange({ maxStock: v })}
        />
      </div>

      {/* Unidade e temperatura */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Unidade de Medida
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {["unidade", "kg", "litro"].map((u) => (
              <Chip
                key={u}
                label={u}
                active={(formData.unit ?? "") === u}
                onClick={() => setUnit(u)}
              />
            ))}
          </div>
          <input
            type="text"
            value={formData.unit ?? ""}
            onChange={(e) => setUnit(e.target.value)}
            placeholder="Ex.: unidade, kg, litro"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            aria-label="Unidade de Medida"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Temperatura
          </label>
          <div className="flex flex-wrap gap-2">
            <Chip
              label="🥶 Gelado"
              active={(formData.temperature ?? "") === "cold"}
              onClick={() => onFormDataChange({ temperature: "cold" })}
            />
            <Chip
              label="🔥 Quente"
              active={formData.temperature === "hot"}
              onClick={() => onFormDataChange({ temperature: "hot" })}
            />
            <Chip
              label="🌡️ Ambiente"
              active={formData.temperature === "room"}
              onClick={() => onFormDataChange({ temperature: "room" })}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Produto Retornável
          </label>
          <div className="flex items-center gap-2">
            <Chip
              label={formData.returnable ? "Sim" : "Não"}
              active={!!formData.returnable}
              onClick={() =>
                onFormDataChange({ returnable: !formData.returnable })
              }
            />
            <p className="text-sm text-gray-500">
              Ex.: garrafas de vidro podem retornar ao estoque.
            </p>
          </div>
        </div>
      </div>

      {/* Volume (para bebidas) */}
      {showAdvanced && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <NumberField
            label="Volume"
            value={formData.volume}
            min={0}
            step={0.01}
            placeholder="Ex.: 350"
            suffix={
              formData.volumeUnit === "l"
                ? "L"
                : formData.volumeUnit === "ml"
                ? "ml"
                : ""
            }
            onChange={(v) => onFormDataChange({ volume: v })}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unidade de Volume
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {["ml", "l"].map((vu) => (
                <Chip
                  key={vu}
                  label={vu.toUpperCase()}
                  active={(formData.volumeUnit ?? "") === vu}
                  onClick={() => setVolumeUnit(vu)}
                />
              ))}
            </div>
            <select
              value={formData.volumeUnit ?? ""}
              onChange={(e) => setVolumeUnit(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              aria-label="Unidade de Volume"
            >
              <option value="">Selecione</option>
              <option value="ml">Mililitros (ml)</option>
              <option value="l">Litros (l)</option>
            </select>
          </div>
        </div>
      )}

      {/* Configurações de Alertas */}
      <div className="mt-8">
        <h3 className="text-md font-medium text-gray-900 mb-3">
          Configurações de Alertas
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="flex items-start gap-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              checked={!!formData.stockAlerts}
              onChange={(e) =>
                onFormDataChange({ stockAlerts: e.target.checked })
              }
            />
            <div className="text-sm">
              <p className="font-medium text-gray-700">Alertas de Estoque</p>
              <p className="text-gray-500">
                Receba notificações quando o estoque ficar baixo.
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              checked={!!formData.autoRestock}
              onChange={(e) =>
                onFormDataChange({ autoRestock: e.target.checked })
              }
            />
            <div className="text-sm">
              <p className="font-medium text-gray-700">Reposição Automática</p>
              <p className="text-gray-500">
                Sugerir compra quando atingir o mínimo definido.
              </p>
            </div>
          </label>

          <div className="rounded-lg border border-gray-200 p-3">
            <p className="text-sm font-medium text-gray-700 mb-2">Atalhos</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  onFormDataChange({ stockAlerts: true, autoRestock: true })
                }
                className="px-3 py-1.5 text-xs rounded-md border border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
              >
                Habilitar tudo
              </button>
              <button
                type="button"
                onClick={() =>
                  onFormDataChange({ stockAlerts: false, autoRestock: false })
                }
                className="px-3 py-1.5 text-xs rounded-md border border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
              >
                Desabilitar tudo
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Erros de validação */}
      {stockErrors.length > 0 && (
        <div className="mt-6 p-3 bg-red-50 border border-red-200 rounded-md">
          <h4 className="text-sm font-semibold text-red-800">
            Erros de validação
          </h4>
          <ul className="mt-2 list-disc pl-5 text-sm text-red-700 space-y-1">
            {stockErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
