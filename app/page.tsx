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

  // Inicialização segura do Supabase para evitar erros no build estático da Vercel
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
      padding: '20px' 
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* Cabeçalho */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 5px 0', background: 'linear-gradient(90deg, #60a5fa, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Blue Brothers Coins
            </h1>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px' }}>A sua plataforma segura para moedas e itens virtuais</p>
          </div>
          {step !== 'catalog' && (
            <button 
              onClick={() => setStep('catalog')}
              style={{ background: '#1e293b', border: '1px solid #334155', color: '#f8fafc', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
            >
              ← Voltar ao Catálogo
            </button>
          )}
        </header>

        {/* Conteúdo Principal */}
        {step === 'catalog' && (
          <main>
            {/* Filtros de Jogos */}
            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '15px', marginBottom: '25px' }}>
              {['Todos', 'Pokesigma', 'Pokeidle World', 'Pokeidl', 'Huntera', 'Pokepixel', 'Pkhunt'].map((game) => (
                <button
                  key={game}
                  onClick={() => setSelectedGame(game)}
                  style={{
                    background: selectedGame === game ? '#3b82f6' : '#1e293b',
                    color: selectedGame === game ? '#ffffff' : '#cbd5e1',
                    border: selectedGame === game ? '1px solid #60a5fa' : '1px solid #334155',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s'
                  }}
                >
                  {game}
                </button>
              ))}
            </div>

            {/* Listagem de Produtos / Stock */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '50px', color: '#94a3b8' }}>A carregar stock disponível...</div>
            ) : filteredStocks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '50px', background: 'rgba(30, 41, 59, 0.7)', borderRadius: '12px', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <p style={{ color: '#94a3b8', fontSize: '16px', margin: 0 }}>Nenhum item disponível no momento para este jogo.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {filteredStocks.map((stock) => {
                  const spriteUrl = GAME_SPRITES[stock.game_name];
                  return (
                    <div 
                      key={stock.id}
                      style={{
                        background: 'rgba(15, 23, 42, 0.85)',
                        border: '1px solid rgba(51, 65, 85, 0.8)',
                        borderRadius: '16px',
                        padding: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        backdropFilter: 'blur(10px)',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                          <span style={{ fontSize: '12px', background: '#334155', color: '#93c5fd', padding: '4px 8px', borderRadius: '6px', fontWeight: '600' }}>
                            {stock.game_name}
                          </span>
                          <span style={{ fontSize: '13px', color: stock.stock_amount > 0 ? '#4ade80' : '#f87171', fontWeight: '600' }}>
                            {stock.stock_amount > 0 ? `${stock.stock_amount} em stock` : 'Esgotado'}
                          </span>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
                          {spriteUrl ? (
                            <img src={spriteUrl} alt={stock.currency_name} style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                          ) : (
                            <span style={{ fontSize: '32px' }}>💎</span>
                          )}
                          <div>
                            <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', color: '#f8fafc' }}>{stock.currency_name}</h3>
                            <p style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#38bdf8' }}>
                              R$ {Number(stock.price_per_unit).toFixed(2)} <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 'normal' }}>/ un</span>
                            </p>
                          </div>
                        </div>
                      </div>

                      <button
                        disabled={stock.stock_amount <= 0}
                        onClick={() => handleStartPurchase(stock)}
                        style={{
                          width: '100%',
                          background: stock.stock_amount > 0 ? 'linear-gradient(90deg, #2563eb, #3b82f6)' : '#334155',
                          color: stock.stock_amount > 0 ? '#ffffff' : '#94a3b8',
                          border: 'none',
                          padding: '12px',
                          borderRadius: '10px',
                          fontWeight: 'bold',
                          cursor: stock.stock_amount > 0 ? 'pointer' : 'not-allowed',
                          transition: 'opacity 0.2s'
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
          <div style={{ maxWidth: '500px', margin: '40px auto', background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(51, 65, 85, 0.8)', padding: '30px', borderRadius: '16px', backdropFilter: 'blur(10px)' }}>
            <h2 style={{ marginTop: 0, marginBottom: '20px', fontSize: '22px', color: '#f8fafc' }}>Finalizar Compra</h2>
            
            <div style={{ background: '#1e293b', padding: '15px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #334155' }}>
              <p style={{ margin: '0 0 5px 0', color: '#94a3b8', fontSize: '13px' }}>Item Selecionado:</p>
              <p style={{ margin: '0 0 10px 0', fontSize: '16px', fontWeight: 'bold', color: '#f8fafc' }}>{selectedStock.currency_name} ({selectedStock.game_name})</p>
              <p style={{ margin: 0, color: '#38bdf8', fontSize: '14px', fontWeight: '650' }}>Preço Unitário: R$ {Number(selectedStock.price_per_unit).toFixed(2)}</p>
            </div>

            {purchaseError && (
              <div style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#fca5a5', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '14px' }}>
                {purchaseError}
              </div>
            )}

            <form onSubmit={handleConfirmPurchase}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#cbd5e1' }}>Quantidade:</label>
                <input 
                  type="number"
                  min="1"
                  max={selectedStock.stock_amount}
                  value={amountToBuy}
                  onChange={(e) => setAmountToBuy(parseInt(e.target.value) || 1)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334155', color: '#fff', fontSize: '16px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#cbd5e1' }}>Seu E-mail (para entrega):</label>
                <input 
                  type="email"
                  required
                  placeholder="exemplo@email.com"
                  value={buyerEmail}
                  onChange={(e) => setBuyerEmail(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334155', color: '#fff', fontSize: '16px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ background: '#1e293b', padding: '15px', borderRadius: '10px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#94a3b8', fontSize: '14px' }}>Total a pagar:</span>
                <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#4ade80' }}>
                  R$ {(amountToBuy * Number(selectedStock.price_per_unit)).toFixed(2)}
                </span>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                style={{
                  width: '100%',
                  background: isProcessing ? '#475569' : '#22c55e',
                  color: '#ffffff',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '10px',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  cursor: isProcessing ? 'not-allowed' : 'pointer'
                }}
              >
                {isProcessing ? 'A processar...' : 'Confirmar e Pagar'}
              </button>
            </form>
          </div>
        )}

        {/* Ecrã de Sucesso */}
        {step === 'success' && (
          <div style={{ maxWidth: '500px', margin: '40px auto', background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(51, 65, 85, 0.8)', padding: '40px 30px', borderRadius: '16px', textAlign: 'center', backdropFilter: 'blur(10px)' }}>
            <div style={{ fontSize: '50px', marginBottom: '15px' }}>🎉</div>
            <h2 style={{ marginTop: 0, color: '#4ade80', marginBottom: '10px' }}>Compra Realizada com Sucesso!</h2>
            <p style={{ color: '#94a3b8', fontSize: '15px', lineHeight: '1.5', marginBottom: '25px' }}>
              Obrigado pela sua compra. Os detalhes e instruções de entrega foram enviados para o ecrã e registados no nosso sistema.
            </p>
            <button
              onClick={() => setStep('catalog')}
              style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' }}
            >
              Voltar ao Início
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
