'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith('http') 
  ? process.env.NEXT_PUBLIC_SUPABASE_URL 
  : 'https://placeholder.supabase.co'

const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

const ADMIN_WHATSAPP = '5534984113460'

// MAPA DE SPRITES/ÍCONES DAS MOEDAS (Cole a URL da imagem/sprite entre as aspas quando quiser adicionar)
const GAME_SPRITES: { [key: string]: string } = {
  'Pokesigma': '', 
  'Pokeidle World': '',
  'Pokeidl': '',
  'Huntera': '',
  'Pokepixel': '',
  'Pkhunt': ''
}

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
      
      {/* Header (Sem botão do admin) */}
      <header style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px 0', borderBottom: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '42px', height: '42px', backgroundColor: '#0284c7', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '20px', color: '#fff', boxShadow: '0 0 15px rgba(2, 132, 199, 0.5)' }}>
            BB
          </div>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '26px', fontWeight: '900', margin: 0, background: 'linear-gradient(to right, #38bdf8, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.5px' }}>
              BLUE BROTHERS COINS
            </h1>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Sua Loja Gamer de Confiança
            </span>
          </div>
        </div>
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
          {games.map((g) => {
            const spriteUrl = GAME_SPRITES[g.game_name] || ''

            return (
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
                      {/* Espaço reservado para Sprite das moedas */}
                      <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#1e293b', border: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        {spriteUrl ? (
                          <img src={spriteUrl} alt={g.game_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <span style={{ fontSize: '16px' }}>🎮</span>
                        )}
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
            )
          })}
        </div>

        {/* Modal */}
        {selectedGame && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 1000 }}>
            <div style={{ backgroundColor: '#0f172a', padding: '32px', borderRadius: '20px', maxWidth: '450px', width: '100%', border: '1px solid #334155', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems:
