'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

// URL de fallback garantida e válida para evitar qualquer falha no build
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith('http') 
  ? process.env.NEXT_PUBLIC_SUPABASE_URL 
  : 'https://placeholder.supabase.co'

const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Seu WhatsApp configurado com DDI + DDD + Número
const ADMIN_WHATSAPP = '5534984113460'

const FALLBACK_GAMES = [
  { id: 1, game_name: 'Pokesigma', currency_name: 'diamond', mode: 'selling', stock_quantity: 50000, price_per_unit: 4.50 },
  { id: 2, game_name: 'Pokeidle World', currency_name: 'diamonds', mode: 'selling', stock_quantity: 120000, price_per_unit: 3.00 },
  { id: 3, game_name: 'Pokeidl', currency_name: 'gemas', mode: 'selling', stock_quantity: 80000, price_per_unit: 5.00 },
  { id: 4, game_name: 'Huntera', currency_name: 'coins', mode: 'selling', stock_quantity: 200000, price_per_unit: 2.50 },
  { id: 5, game_name: 'Pokepixel', currency_name: 'diamonds', mode: 'selling', stock_quantity: 45000, price_per_unit: 6.00 },
  { id: 6, game_name: 'Pkhunt', currency_name: 'safiras', mode: 'selling', stock_quantity: 30000, price_per_unit: 7.50 },
]

interface GameConfig {
  id: number
  game_name: string
  currency_name: string
  mode: string
  stock_quantity: number
  price_per_unit: number
}

export default function HomePage() {
  const [games, setGames] = useState<GameConfig[]>(FALLBACK_GAMES)
  const [selectedGame, setSelectedGame] = useState<GameConfig | null>(null)
  const [amount, setAmount] = useState('')
  const [characterName, setCharacterName] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function fetchGames() {
      if (supabaseUrl.includes('placeholder')) return

      try {
        const { data } = await supabase.from('site_config').select('*')
        if (data && data.length > 0) {
          setGames(data)
        }
      } catch (err) {
        console.error('A usar dados de fallback:', err)
      }
    }
    fetchGames()
  }, [])

  const calculatedTotal = selectedGame && amount 
    ? (Number(amount) / 1000) * Number(selectedGame.price_per_unit || 0) 
    : 0

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedGame || !amount || !characterName || !whatsapp) return

    setSubmitting(true)

    const currencyText = selectedGame.currency_name || 'coins'
    const orderType = selectedGame.mode === 'selling' ? 'Compra de Cliente' : 'Venda para Loja'

    try {
      if (!supabaseUrl.includes('placeholder')) {
        await supabase.from('transactions').insert([
          {
            game_name: `${selectedGame.game_name} (${currencyText})`,
            type: orderType,
            amount: Number(amount),
            total_price: calculatedTotal,
            user_contact: whatsapp,
            character_name: characterName,
          }
        ])
      }
    } catch (err) {
      console.error(err)
    }

    setSubmitting(false)

    // Formata mensagem para o seu WhatsApp
    const message = `🔷 *NOVO PEDIDO - BLUE BROTHERS COINS* 🔷\n\n` +
      `🎮 *Jogo:* ${selectedGame.game_name}\n` +
      `💰 *Operação:* ${orderType}\n` +
      `👤 *Personagem (Nick):* ${characterName}\n` +
      `🪙 *Quantidade:* ${Number(amount).toLocaleString()} ${currencyText.toUpperCase()}\n` +
      `💵 *Valor Total:* R$ ${calculatedTotal.toFixed(2)}\n` +
      `📱 *WhatsApp do Cliente:* ${whatsapp}\n\n` +
      `Aguardando confirmação para envio!`

    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/${ADMIN_WHATSAPP}?text=${encodedMessage}`

    alert(`✅ Pedido registado com sucesso!\nVocê será redirecionado para o WhatsApp para concluir o atendimento.`)
    
    window.open(whatsappUrl, '_blank')

    setSelectedGame(null)
    setAmount('')
    setCharacterName('')
    setWhatsapp('')
  }

  return (
    <div style={{ backgroundColor: '#080c14', color: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif', padding: '20px' }}>
      
      {/* Header */}
      <header style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0', borderBottom: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '42px', height: '42px', backgroundColor: '#0284c7', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '20px', color: '#fff', boxShadow: '0 0 15px rgba(2, 132, 199, 0.5)' }}>
            BB
          </div>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '900', margin: 0, background: 'linear-gradient(to right, #38bdf8, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.5px' }}>
              BLUE BROTHERS COINS
            </h1>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Sua Loja Gamer de Confiança
            </span>
          </div>
        </div>
        <a href="/admin" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '13px', background: '#0f172a', border: '1px solid #334155', padding: '10px 18px', borderRadius: '10px', fontWeight: 'bold' }}>
          ⚙️ Painel Admin
        </a>
      </header>

      {/* Banner */}
      <section style={{ textAlign: 'center', margin: '45px 0 35px 0' }}>
        <span style={{ backgroundColor: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
          ⚡ Entrega Imediata & Cotação Atualizada
        </span>
        <h2 style={{ fontSize: '40px', fontWeight: '900', margin: '15px 0 10px 0', letterSpacing: '-1px' }}>
          Selecione o seu Servidor
        </h2>
        <p style={{ color: '#64748b', fontSize: '16px', maxWidth: '520px', margin: '0 auto' }}>
          Compre ou venda moedas virtuais com total transparência e garantia de recebimento.
        </p>
      </section>

      {/* Grid */}
      <main style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {games.map((g) => (
            <div 
              key={g.id || g.game_name} 
              style={{ 
                backgroundColor: '#0f172a', 
                borderRadius: '20px', 
                padding: '28px', 
                border: '1px solid #1e293b',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#1e293b', border: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>
                      🎮
                    </div>
                    <h3 style={{ fontSize: '22px', fontWeight: '800', margin: 0, color: '#f8fafc' }}>{g.game_name}</h3>
                  </div>
                  <span style={{ 
                    backgroundColor: g.mode === 'selling' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)', 
                    color: g.mode === 'selling' ? '#4ade80' : '#f87171',
                    padding: '6px 12px', 
                    borderRadius: '20px', 
                    fontSize: '12px',
                    fontWeight: '800',
                    border: g.mode === 'selling' ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)'
                  }}>
                    {g.mode === 'selling' ? '🟢 LOJA VENDE' : '🔴 LOJA COMPRA'}
                  </span>
                </div>

                <div style={{ backgroundColor: '#1e293b', padding: '16px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #334155' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: '#94a3b8', fontSize: '14px' }}>
                      Preço / 1k (<strong style={{ color: '#38bdf8', textTransform: 'uppercase' }}>{g.currency_name || 'coins'}</strong>):
                    </span>
                    <strong style={{ color: '#22c55e', fontSize: '16px' }}>R$ {Number(g.price_per_unit || 0).toFixed(2)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8', fontSize: '14px' }}>Estoque em Loja:</span>
                    <strong style={{ color: '#f8fafc', fontSize: '14px' }}>{g.stock_quantity?.toLocaleString()}</strong>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedGame(g)}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: g.mode === 'selling' ? 'linear-gradient(to right, #0284c7, #0369a1)' : 'linear-gradient(to right, #dc2626, #b91c1c)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  fontSize: '16px',
                  boxShadow: g.mode === 'selling' ? '0 4px 15px rgba(2, 132, 199, 0.4)' : '0 4px 15px rgba(220, 38, 38, 0.4)'
                }}
              >
                {g.mode === 'selling' ? `🛒 Comprar ${g.currency_name || 'Coins'}` : `💰 Vender ${g.currency_name || 'Coins'}`}
              </button>
            </div>
          ))}
        </div>

        {/* Modal */}
        {selectedGame && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 1000 }}>
            <div style={{ backgroundColor: '#0f172a', padding: '32px', borderRadius: '20px', maxWidth: '450px', width: '100%', border: '1px solid #334155', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ marginTop: 0, marginBottom: 0, fontSize: '20px', fontWeight: '800' }}>
                  {selectedGame.mode === 'selling' ? `🛒 Comprar - ${selectedGame.game_name}` : `💰 Vender - ${selectedGame.game_name}`}
                </h3>
                <button onClick={() => setSelectedGame(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '20px', cursor: 'pointer' }}>✕</button>
              </div>
              
              <form onSubmit={handleOrder}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', color: '#94a3b8', fontWeight: '800' }}>
                    NOME DO SEU PERSONAGEM (NICK NO JOGO):
                  </label>
                  <input 
                    type="text" 
                    value={characterName} 
                    onChange={(e) => setCharacterName(e.target.value)}
                    placeholder="Ex: PlayerOne"
                    required
                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #334155', backgroundColor: '#1e293b', color: '#fff', boxSizing: 'border-box', fontSize: '15px' }}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', color: '#94a3b8', fontWeight: '800' }}>
                    QUANTIDADE DE {(selectedGame.currency_name || 'COINS').toUpperCase()}:
                  </label>
                  <input 
                    type="number" 
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Ex: 10000"
                    required
                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #334155', backgroundColor: '#1e293b', color: '#fff', boxSizing: 'border-box', fontSize: '16px', fontWeight: 'bold' }}
                  />

                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    {[1000, 5000, 10000, 50000].map((quick) => (
                      <button
                        key={quick}
                        type="button"
                        onClick={() => setAmount(String(quick))}
                        style={{ flex: 1, padding: '6px', backgroundColor: '#1e293b', color: '#38bdf8', border: '1px solid #334155', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}
                      >
                        +{quick >= 1000 ? `${quick / 1000}k` : quick}
                      </button>
                    ))}
                  </div>
                </div>

                {amount && Number(amount) > 0 && (
                  <div style={{ marginBottom: '16px', padding: '14px', backgroundColor: '#1e293b', borderRadius: '10px', border: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', color: '#94a3b8' }}>Valor Total a Pagar:</span>
                    <strong style={{ fontSize: '20px', color: '#22c55e' }}>R$ {calculatedTotal.toFixed(2)}</strong>
                  </div>
                )}

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', color: '#94a3b8', fontWeight: '800' }}>
                    SEU WHATSAPP (COM DDD):
                  </label>
                  <input 
                    type="text" 
                    value={whatsapp} 
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="Ex: (34) 99999-9999"
                    required
                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #334155', backgroundColor: '#1e293b', color: '#fff', boxSizing: 'border-box', fontSize: '15px' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    type="button" 
                    onClick={() => setSelectedGame(null)}
                    style={{ flex: 1, padding: '14px', backgroundColor: '#1e293b', color: '#94a3b8', border: '1px solid #334155', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    disabled={submitting}
                    style={{ flex: 1, padding: '14px', background: 'linear-gradient(to right, #0284c7, #0369a1)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' }}
                  >
                    {submitting ? 'A enviar...' : 'Confirmar & Ir p/ WhatsApp'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Seção Quem Somos */}
        <section style={{ marginTop: '70px', backgroundColor: '#0f172a', borderRadius: '20px', padding: '40px', border: '1px solid #1e293b' }}>
          <h2 style={{ fontSize: '26px', fontWeight: '800', marginBottom: '15px', color: '#38bdf8' }}>
            Quem Somos - Blue Brothers Coins
          </h2>
          <p style={{ color: '#94a3b8', lineHeight: '1.7', fontSize: '15px', marginBottom: '20px' }}>
            A **Blue Brothers Coins** é a sua plataforma especializada no comércio de moedas virtuais para os principais servidores de jogos online. Fundada com o compromisso de entregar segurança máxima, rapidez absoluta e cotações justas, facilitamos o processo de compra e venda com atendimento dedicado via WhatsApp.
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginTop: '25px' }}>
            <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#f8fafc' }}>⚡ Entrega Rápida</h3>
              <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>Transferências efetuadas logo após a confirmação do pagamento.</p>
            </div>
            <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#f8fafc' }}>🛡️ 100% Seguro</h3>
              <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>Processo transparente e suporte humanizado direto no WhatsApp.</p>
            </div>
            <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#f8fafc' }}>💎 Melhores Cotações</h3>
              <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>Preços atualizados diariamente para garantir a melhor negociação.</p>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer style={{ maxWidth: '1100px', margin: '50px auto 20px auto', textAlign: 'center', borderTop: '1px solid #1e293b', paddingTop: '20px', color: '#64748b', fontSize: '13px' }}>
        © {new Date().getFullYear()} Blue Brothers Coins. Todos os direitos reservados.
      </footer>
    </div>
  )
}
