'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseUrl = (rawUrl && rawUrl.startsWith('http')) ? rawUrl : 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

interface GameConfig {
  id: number
  game_name: string
  mode: string
  stock_quantity: number
}

interface Transaction {
  id: number
  game_name: string
  type: string
  amount: number
  price: number
  user_contact: string
  created_at: string
}

export default function AdminPage() {
  const [games, setGames] = useState<GameConfig[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [gameName, setGameName] = useState('')
  const [mode, setMode] = useState('selling')
  const [stockQuantity, setStockQuantity] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    if (supabaseUrl.includes('placeholder')) {
      setLoading(false)
      return
    }

    const { data: gamesData } = await supabase.from('site_config').select('*')
    const { data: transData } = await supabase.from('transactions').select('*').order('id', { ascending: false })

    if (gamesData) setGames(gamesData)
    if (transData) setTransactions(transData)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSaveGame = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!gameName) return alert('Por favor digite o nome do jogo.')

    const { error } = await supabase
      .from('site_config')
      .upsert(
        { 
          game_name: gameName.toLowerCase().trim(), 
          mode, 
          stock_quantity: Number(stockQuantity) || 0 
        },
        { onConflict: 'game_name' }
      )

    if (error) {
      alert('Erro ao salvar: ' + error.message)
    } else {
      alert('Jogo salvo com sucesso!')
      setGameName('')
      setStockQuantity('')
      fetchData()
    }
  }

  return (
    <div style={{ backgroundColor: '#0f172a', color: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', padding: '30px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Topo */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid #334155', paddingBottom: '15px' }}>
          <h1 style={{ margin: 0, fontSize: '24px', color: '#38bdf8' }}>Painel Administrativo - Coins</h1>
          <a href="/" style={{ color: '#94a3b8', textDecoration: 'none', background: '#1e293b', padding: '8px 16px', borderRadius: '6px', border: '1px solid #334155' }}>
            ← Voltar para a Loja
          </a>
        </div>

        {/* Formulário de Adicionar Jogo */}
        <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '12px', marginBottom: '30px', border: '1px solid #334155' }}>
          <h2 style={{ marginTop: 0, fontSize: '18px', color: '#f8fafc', marginBottom: '20px' }}>Adicionar ou Atualizar Jogo</h2>
          
          <form onSubmit={handleSaveGame} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '5px' }}>Nome do Jogo / Servidor:</label>
              <input 
                type="text" 
                value={gameName} 
                onChange={(e) => setGameName(e.target.value)} 
                placeholder="Ex: pokesigma"
                required 
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#fff', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '5px' }}>Modo de Operação:</label>
              <select 
                value={mode} 
                onChange={(e) => setMode(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#fff', boxSizing: 'border-box' }}
              >
                <option value="selling">🟢 Vendendo Coins (Loja vende)</option>
                <option value="buying">🔴 Comprando Coins (Loja compra)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '5px' }}>Estoque Atual:</label>
              <input 
                type="number" 
                value={stockQuantity} 
                onChange={(e) => setStockQuantity(e.target.value)} 
                placeholder="Ex: 5000"
                required 
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#fff', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button 
                type="submit" 
                style={{ width: '100%', padding: '10px', backgroundColor: '#22c55e', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Salvar Jogo
              </button>
            </div>
          </form>
        </div>

        {/* Tabela de Jogos Cadastrados */}
        <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '12px', marginBottom: '30px', border: '1px solid #334155' }}>
          <h2 style={{ marginTop: 0, fontSize: '18px', color: '#f8fafc', marginBottom: '15px' }}>Jogos Cadastrados</h2>
          {loading ? (
            <p style={{ color: '#94a3b8' }}>Carregando dados...</p>
          ) : games.length === 0 ? (
            <p style={{ color: '#94a3b8' }}>Nenhum jogo cadastrado.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textTransform: 'capitalize' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #334155', textAlign: 'left', color: '#94a3b8', fontSize: '14px' }}>
                    <th style={{ padding: '10px' }}>Jogo</th>
                    <th style={{ padding: '10px' }}>Modo</th>
                    <th style={{ padding: '10px' }}>Estoque</th>
                  </tr>
                </thead>
                <tbody>
                  {games.map((g) => (
                    <tr key={g.id} style={{ borderBottom: '1px solid #0f172a' }}>
                      <td style={{ padding: '10px', fontWeight: 'bold' }}>{g.game_name}</td>
                      <td style={{ padding: '10px', color: g.mode === 'selling' ? '#4ade80' : '#f87171' }}>
                        {g.mode === 'selling' ? '🟢 Vendendo' : '🔴 Comprando'}
                      </td>
                      <td style={{ padding: '10px' }}>{g.stock_quantity.toLocaleString()} Coins</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Histórico de Solicitações */}
        <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid #334155' }}>
          <h2 style={{ marginTop: 0, fontSize: '18px', color: '#f8fafc', marginBottom: '15px' }}>Pedidos / Solicitações dos Clientes</h2>
          {transactions.length === 0 ? (
            <p style={{ color: '#94a3b8' }}>Nenhum pedido recebido até o momento.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #334155', textAlign: 'left', color: '#94a3b8', fontSize: '14px' }}>
                    <th style={{ padding: '10px' }}>ID</th>
                    <th style={{ padding: '10px' }}>Jogo</th>
                    <th style={{ padding: '10px' }}>Tipo</th>
                    <th style={{ padding: '10px' }}>Quantidade</th>
                    <th style={{ padding: '10px' }}>Contato do Cliente</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => (
                    <tr key={t.id} style={{ borderBottom: '1px solid #0f172a' }}>
                      <td style={{ padding: '10px', color: '#94a3b8' }}>#{t.id}</td>
                      <td style={{ padding: '10px', fontWeight: 'bold', textTransform: 'capitalize' }}>{t.game_name}</td>
                      <td style={{ padding: '10px' }}>{t.type}</td>
                      <td style={{ padding: '10px' }}>{t.amount.toLocaleString()} Coins</td>
                      <td style={{ padding: '10px', color: '#38bdf8', fontWeight: 'bold' }}>{t.user_contact}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
