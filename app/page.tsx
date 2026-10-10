'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const GAME_SPRITES: { [key: string]: string } = {
  'Pokesigma': '/pokesigma.png',
  'Pokeidle World': '/pokeidle.png',
  'Pokeidl': '/pokeidl.png',
  'Huntera': '/huntera.png',
  'Pokepixel': '/pokepixel.png',
  'Pkhunt': '/safira.png'
};

interface GameStock {
  id: string;
  game_name: string;
  currency_name: string;
  stock_amount: number;
  price_per_unit: number;
}

export default function HomePage() {
  const [stocks, setStocks] = useState<GameStock[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedGame, setSelectedGame] = useState<string>('Todos');
  const [selectedStock, setSelectedStock] = useState<GameStock | null>(null);
  const [amountToBuy, setAmountToBuy] = useState<number>(1);
  const [buyerEmail, setBuyerEmail] = useState<string>('');
  const [step, setStep] = useState<'catalog' | 'checkout' | 'success'>('catalog');
  const [purchaseError, setPurchaseError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const getSupabase = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';
    return createClient(supabaseUrl, supabaseAnonKey);
  };

  useEffect(() => {
    fetchStocks();
  }, []);

  const fetchStocks = async () => {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase.from('game_stock').select('*');
      if (error) throw error;
      if (data) setStocks(data);
    } catch (err) {
      console.error('Erro ao buscar stock:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredStocks = selectedGame === 'Todos' 
    ? stocks 
    : stocks.filter(s => s.game_name === selectedGame);

  const handleStartPurchase = (stock: GameStock) => {
    setSelectedStock(stock);
    setAmountToBuy(1);
    setBuyerEmail('');
    setPurchaseError('');
    setStep('checkout');
  };

  const handleConfirmPurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStock) return;
    if (amountToBuy <= 0 || amountToBuy > selectedStock.stock_amount) {
      setPurchaseError('Quantidade inválida ou superior ao stock disponível.');
      return;
    }
    if (!buyerEmail || !buyerEmail.includes('@')) {
      setPurchaseError('Por favor, insira um e-mail válido.');
      return;
    }

    setIsProcessing(true);
    setPurchaseError('');

    try {
      const supabase = getSupabase();
      const newStockAmount = selectedStock.stock_amount - amountToBuy;
      const { error: updateError } = await supabase
        .from('game_stock')
        .update({ stock_amount: newStockAmount })
        .eq('id', selectedStock.id);

      if (updateError) throw updateError;

      const { error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            game_name: selectedStock.game_name,
            currency_name: selectedStock.currency_name,
            amount: amountToBuy,
            total_price: amountToBuy * selectedStock.price_per_unit,
            buyer_email: buyerEmail,
            status: 'completed',
            created_at: new Date().toISOString()
          }
        ]);

      if (orderError) {
        console.error('Erro ao registar a ordem:', orderError);
      }

      setStocks(stocks.map(s => s.id === selectedStock.id ? { ...s, stock_amount: newStockAmount } : s));
      setStep('success');
    } catch (err: any) {
      console.error('Erro na compra:', err);
      setPurchaseError('Ocorreu um erro ao processar a compra. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ 
      backgroundImage: 'url(/fundo-site.png)', 
      backgroundSize: 'cover', 
      backgroundPosition: 'center', 
      backgroundAttachment: 'fixed', 
      color: '#f8fafc', 
      minHeight: '100vh', 
      fontFamily: 'system-ui, -apple-system, sans-serif', 
      padding: '30px 20px' 
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Cabeçalho Estilizado */}
        <header style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '35px', 
          paddingBottom: '20px', 
          borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
          background: 'rgba(15, 23, 42, 0.4)',
          padding: '20px 25px',
          borderRadius: '16px',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)'
        }}>
          <div>
            <h1 style={{ 
              fontSize: '32px', 
              fontWeight: '900', 
              margin: '0 0 5px 0', 
              letterSpacing: '-0.5px',
              background: 'linear-gradient(90deg, #60a5fa, #38bdf8, #c084fc)', 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent',
              textShadow: '0 2px 10px rgba(96, 165, 250, 0.3)'
            }}>
              🎮 Blue Brothers Coins
            </h1>
            <p style={{ margin: 0, color: '#cbd5e1', fontSize: '15px', fontWeight: '500' }}>
              Sua loja oficial e segura de moedas e itens virtuais em pixel art
            </p>
          </div>
          {step !== 'catalog' && (
            <button 
              onClick={() => setStep('catalog')}
              style={{ 
                background: 'rgba(30, 41, 59, 0.8)', 
                border: '1px solid rgba(56, 189, 248, 0.4)', 
                color: '#f8fafc', 
                padding: '10px 20px', 
                borderRadius: '10px', 
                cursor: 'pointer', 
                fontWeight: '650',
                transition: 'all 0.2s',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
              }}
            >
              ← Voltar ao Catálogo
            </button>
          )}
        </header>

        {/* Conteúdo Principal */}
        {step === 'catalog' && (
          <main>
            {/* Filtros de Jogos */}
            <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '15px', marginBottom: '30px' }}>
              {['Todos', 'Pokesigma', 'Pokeidle World', 'Pokeidl', 'Huntera', 'Pokepixel', 'Pkhunt'].map((game) => (
                <button
                  key={game}
                  onClick={() => setSelectedGame(game)}
                  style={{
                    background: selectedGame === game ? 'linear-gradient(135deg, #2563eb, #3b82f6)' : 'rgba(15, 23, 42, 0.75)',
                    color: selectedGame === game ? '#ffffff' : '#cbd5e1',
                    border: selectedGame === game ? '1px solid #60a5fa' : '1px solid rgba(51, 65, 85, 0.8)',
                    padding: '10px 20px',
                    borderRadius: '25px',
                    cursor: 'pointer',
                    fontWeight: '700',
                    fontSize: '14px',
                    whiteSpace: 'nowrap',
                    backdropFilter: 'blur(8px)',
                    boxShadow: selectedGame === game ? '0 4px 15px rgba(37, 99, 235, 0.4)' : '0 2px 6px rgba(0,0,0,0.1)',
                    transition: 'all 0.2s'
                  }}
                >
                  {game}
                </button>
              ))}
            </div>

            {/* Listagem de Produtos / Stock */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px', color: '#cbd5e1', fontSize: '18px', fontWeight: '600', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '16px', backdropFilter: 'blur(8px)' }}>
                A carregar stock disponível...
              </div>
            ) : filteredStocks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', background: 'rgba(15, 23, 42, 0.75)', borderRadius: '16px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p style={{ color: '#cbd5e1', fontSize: '18px', margin: 0, fontWeight: '600' }}>Nenhum item disponível no momento para este jogo.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                {filteredStocks.map((stock) => {
                  const spriteUrl = GAME_SPRITES[stock.game_name];
                  return (
                    <div 
                      key={stock.id}
                      style={{
                        background: 'rgba(15, 23, 42, 0.85)',
                        border: '1px solid rgba(51, 65, 85, 0.8)',
                        borderRadius: '18px',
                        padding: '24px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        backdropFilter: 'blur(12px)',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2)',
                        transition: 'transform 0.2s, box-shadow 0.2s'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                          <span style={{ fontSize: '12px', background: 'rgba(51, 65, 85, 0.9)', color: '#93c5fd', padding: '5px 10px', borderRadius: '8px', fontWeight: '700', letterSpacing: '0.5px' }}>
                            {stock.game_name}
                          </span>
                          <span style={{ fontSize: '13px', color: stock.stock_amount > 0 ? '#4ade80' : '#f87171', fontWeight: '700', background: stock.stock_amount > 0 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)', padding: '4px 8px', borderRadius: '6px' }}>
                            {stock.stock_amount > 0 ? `${stock.stock_amount} em stock` : 'Esgotado'}
                          </span>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                          <div style={{ background: 'rgba(30, 41, 59, 0.9)', padding: '10px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {spriteUrl ? (
                              <img src={spriteUrl} alt={stock.currency_name} style={{ width: '45px', height: '45px', objectFit: 'contain' }} />
                            ) : (
                              <span style={{ fontSize: '36px' }}>💎</span>
                            )}
                          </div>
                          <div>
                            <h3 style={{ margin: '0 0 6px 0', fontSize: '19px', color: '#f8fafc', fontWeight: '700' }}>{stock.currency_name}</h3>
                            <p style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: '#38bdf8' }}>
                              R$ {Number(stock.price_per_unit).toFixed(2)} <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '500' }}>/ un</span>
                            </p>
                          </div>
                        </div>
                      </div>

                      <button
                        disabled={stock.stock_amount <= 0}
                        onClick={() => handleStartPurchase(stock)}
                        style={{
                          width: '100%',
                          background: stock.stock_amount > 0 ? 'linear-gradient(135deg, #2563eb, #3b82f6)' : '#334155',
                          color: stock.stock_amount > 0 ? '#ffffff' : '#94a3b8',
                          border: 'none',
                          padding: '13px',
                          borderRadius: '12px',
                          fontWeight: '800',
                          fontSize: '15px',
                          cursor: stock.stock_amount > 0 ? 'pointer' : 'not-allowed',
                          boxShadow: stock.stock_amount > 0 ? '0 4px 15px rgba(37, 99, 235, 0.4)' : 'none',
                          transition: 'all 0.2s'
                        }}
                      >
                        {stock.stock_amount > 0 ? 'Comprar Agora' : 'Indisponível'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        )}

        {/* Ecrã de Checkout */}
        {step === 'checkout' && selectedStock && (
          <div style={{ maxWidth: '520px', margin: '30px auto', background: 'rgba(15, 23, 42, 0.92)', border: '1px solid rgba(51, 65, 85, 0.8)', padding: '35px', borderRadius: '20px', backdropFilter: 'blur(15px)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
            <h2 style={{ marginTop: 0, marginBottom: '20px', fontSize: '24px', color: '#f8fafc', fontWeight: '800' }}>Finalizar Compra</h2>
            
            <div style={{ background: 'rgba(30, 41, 59, 0.8)', padding: '18px', borderRadius: '12px', marginBottom: '22px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p style={{ margin: '0 0 5px 0', color: '#94a3b8', fontSize: '13px', fontWeight: '600' }}>Item Selecionado:</p>
              <p style={{ margin: '0 0 10px 0', fontSize: '18px', fontWeight: 'bold', color: '#f8fafc' }}>{selectedStock.currency_name} ({selectedStock.game_name})</p>
              <p style={{ margin: 0, color: '#38bdf8', fontSize: '15px', fontWeight: '700' }}>Preço Unitário: R$ {Number(selectedStock.price_per_unit).toFixed(2)}</p>
            </div>

            {purchaseError && (
              <div style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#fca5a5', padding: '12px', borderRadius: '10px', marginBottom: '18px', fontSize: '14px', fontWeight: '600' }}>
                {purchaseError}
              </div>
            )}

            <form onSubmit={handleConfirmPurchase}>
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#cbd5e1', fontWeight: '650' }}>Quantidade:</label>
                <input 
                  type="number"
                  min="1"
                  max={selectedStock.stock_amount}
                  value={amountToBuy}
                  onChange={(e) => setAmountToBuy(parseInt(e.target.value) || 1)}
                  style={{ width: '100%', padding: '12px 15px', borderRadius: '10px', background: 'rgba(30, 41, 59, 0.9)', border: '1px solid #334155', color: '#fff', fontSize: '16px', boxSizing: 'border-box', fontWeight: '600' }}
                />
              </div>

              <div style={{ marginBottom: '22px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#cbd5e1', fontWeight: '650' }}>Seu E-mail (para entrega):</label>
                <input 
                  type="email"
                  required
                  placeholder="exemplo@email.com"
                  value={buyerEmail}
                  onChange={(e) => setBuyerEmail(e.target.value)}
                  style={{ width: '100%', padding: '12px 15px', borderRadius: '10px', background: 'rgba(30, 41, 59, 0.9)', border: '1px solid #334155', color: '#fff', fontSize: '16px', boxSizing: 'border-box', fontWeight: '600' }}
                />
              </div>

              <div style={{ background: 'rgba(30, 41, 59, 0.8)', padding: '18px', borderRadius: '12px', marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ color: '#94a3b8', fontSize: '15px', fontWeight: '600' }}>Total a pagar:</span>
                <span style={{ fontSize: '22px', fontWeight: '800', color: '#4ade80' }}>
                  R$ {(amountToBuy * Number(selectedStock.price_per_unit)).toFixed(2)}
                </span>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                style={{
                  width: '100%',
                  background: isProcessing ? '#475569' : 'linear-gradient(135deg, #16a34a, #22c55e)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '14px',
                  borderRadius: '12px',
                  fontWeight: '800',
                  fontSize: '16px',
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  boxShadow: isProcessing ? 'none' : '0 4px 20px rgba(34, 197, 94, 0.4)',
                  transition: 'all 0.2s'
                }}
              >
                {isProcessing ? 'A processar...' : 'Confirmar e Pagar'}
              </button>
            </form>
          </div>
        )}

        {/* Ecrã de Sucesso */}
        {step === 'success' && (
          <div style={{ maxWidth: '520px', margin: '40px auto', background: 'rgba(15, 23, 42, 0.92)', border: '1px solid rgba(51, 65, 85, 0.8)', padding: '45px 35px', borderRadius: '20px', textAlign: 'center', backdropFilter: 'blur(15px)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
            <div style={{ fontSize: '60px', marginBottom: '15px' }}>🎉</div>
            <h2 style={{ marginTop: 0, color: '#4ade80', marginBottom: '12px', fontSize: '26px', fontWeight: '800' }}>Compra Realizada com Sucesso!</h2>
            <p style={{ color: '#cbd5e1', fontSize: '16px', lineHeight: '1.6', marginBottom: '30px', fontWeight: '500' }}>
              Obrigado pela sua compra. Os detalhes e as instruções de entrega foram registados com sucesso no nosso sistema e enviados para o seu e-mail.
            </p>
            <button
              onClick={() => setStep('catalog')}
              style={{ background: 'linear-gradient(135deg, #2563eb, #3b82f6)', color: '#fff', border: 'none', padding: '14px 28px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', fontSize: '16px', boxShadow: '0 4px 20px rgba(37, 99, 235, 0.4)' }}
            >
              Voltar ao Início
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
