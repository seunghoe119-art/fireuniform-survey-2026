"use client";

import { FormEvent, useState } from "react";
import type { SurveyMember } from "@/lib/types";
import products from "./data/products.json";

type Match = SurveyMember;

const LIMIT = 90000;
const money = (value: number) => `${new Intl.NumberFormat("ko-KR").format(value)}원`;
const productMap = new Map(products.map((product) => [product.id, product]));

export default function Home() {
  const [name, setName] = useState("");
  const [member, setMember] = useState<Match | null>(null);
  const [error, setError] = useState("");

  async function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMember(null);
    const normalized = name.trim().replace(/\s+/g, "");
    if (!normalized) return setError("성명을 입력해 주세요.");
    try {
      const response = await fetch(`/api/member?name=${encodeURIComponent(normalized)}`);
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "대원을 찾지 못했습니다.");
      const rows = payload.members as Match[];
      if (!rows.length) return setError("조사 대상자 명단에서 이름을 찾지 못했습니다. 담당자에게 명단 포함 여부를 확인해 주세요.");
      if (rows.length > 1) return setError("같은 이름이 여러 명 등록되어 있습니다. 담당자에게 확인해 주세요.");
      setMember(rows[0]);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "조회 중 오류가 발생했습니다.");
    }
  }

  const availableProducts = member?.group === "existing" && member.totalAmount < LIMIT
    ? products.filter((product) => product.price > 0 && !member.purchased.includes(product.id) && product.price <= LIMIT - member.totalAmount)
    : [];
  const neededProducts = member?.group === "new"
    ? member.needs.map((id) => productMap.get(id)).filter((product) => product !== undefined)
    : [];
  const balance = member?.group === "existing" ? Math.max(0, LIMIT - member.totalAmount) : 0;

  return (
    <main className="site-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="피복 조사 홈">
          <span className="brand-mark">소</span>
          <span><strong>피복 조회</strong><small>구매 가능 품목 조회</small></span>
        </a>
        <span className="period">2026 상반기</span>
      </header>

      <section className="hero">
        <p className="eyebrow">UNIFORM LOOKUP · 2026</p>
        <h1>피복 구매 가능<br className="mobile-break" /> 품목 조회</h1>
        <p className="hero-copy">성명을 검색하면 현재 입력된 금액과<br className="desktop-break" /> 구매 가능한 품목을 확인할 수 있습니다.</p>
      </section>

      <section className="lookup panel">
        <form onSubmit={search} className="search-form">
          <label htmlFor="member-name">대원 성명</label>
          <div className="search-row">
            <input id="member-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="이름을 입력하세요" autoComplete="name" />
            <button className="primary-button" type="submit">조회하기 <span aria-hidden="true">↗</span></button>
          </div>
        </form>
        <p className="privacy-note">조회 전용 페이지입니다. 신청이나 정보 제출 기능은 없습니다.</p>
        {error && <div className="message error" role="alert">{error}</div>}
      </section>

      {member && <section className="result panel" aria-live="polite">
        <div className="result-heading">
          <div><p className="eyebrow">{member.group === "new" ? "NEW MEMBER" : "EXISTING MEMBER"}</p><h2>{member.name} <span>대원님</span></h2></div>
          <button className="text-button" onClick={() => { setMember(null); setName(""); setError(""); }}>다른 이름 조회</button>
        </div>

        {member.group === "existing" ? member.totalAmount >= LIMIT ? <div className="limit-alert"><strong>26년 상반기 피복수요조사 합산 시 9만원 초과</strong><span>현재 입력 금액 {money(member.totalAmount)} · 추가 구매 가능 품목이 없습니다.</span></div> : <>
          <div className="balance-card"><div><span>현재 입력 금액</span><strong>{money(member.totalAmount)}</strong></div><div className="balance-divider" /><div><span>9만원까지 남은 금액</span><strong className="balance-amount">{money(balance)}</strong></div></div>
          <p className="section-title">남은 금액으로 구매 가능한 품목</p>
          {availableProducts.length ? <div className="product-list">{availableProducts.map((product) => <div key={product.id} className="product-row"><span className="product-name">{product.name}</span><strong>{money(product.price)}</strong></div>)}</div> : <div className="empty-state">남은 금액 안에 구매할 수 있는 품목이 없습니다.</div>}
          <p className="privacy-note result-note">조회 결과는 현재 조사표 기준이며, 구매 신청이나 예약으로 이어지지 않습니다.</p>
        </> : <>
          <div className="new-member-note"><span className="spark">✳</span><div><strong>신규 대원 사이즈 조사 대상 품목</strong><p>신규 대원은 9만원 한도와 별도로 ‘필요’ 표시된 품목을 확인합니다.</p></div></div>
          <p className="section-title">조사표의 ‘필요’ 품목 <span>{neededProducts.length}개 품목</span></p>
          <div className="product-list">{neededProducts.map((product) => <div key={product.id} className="product-row"><span className="product-name">{product.name}</span><strong>{product.price > 0 ? money(product.price) : "단가 미등록"}</strong></div>)}</div>
          <p className="privacy-note result-note">이 화면은 품목 조회만 제공하며 사이즈를 입력하거나 제출하지 않습니다.</p>
        </>}
      </section>}

      <footer><span>피복 수요 조사 · 조회 전용</span><span>문의는 담당자에게 해 주세요.</span></footer>
    </main>
  );
}

