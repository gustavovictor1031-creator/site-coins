'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

// Blindagem para evitar erro de URL inválida na build estática da Vercel
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
  const [loading, setLoading] = useState(false)

  // Estados para gerenciar / editar os jogos
  const [gameName, setGameName] = useState('')
  const [mode, setMode] = useState('selling')
  const [stockQuantity, setStockQuantity] = useState('')

  const fetchData = async () => {
    // Se estiver usando o placeholder na build, não tenta buscar dados reais
    if (supabaseUrl.includes('placeholder')) return

    setLoading(true)
    const { data: configData } = await supabase.from('site_config').select('*')
    if (configData) setGames(configData)

    const { data: txData } = await supabase.from('transactions').select('*').order('id', { ascending: false })
    if (txData) setTransactions(txData)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleUpdateConfig = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!gameName) return

    // Atualiza ou insere o jogo/configuração no Supabase
    const { error } = await supabase
      .from('site_config')
      .upsert([
        { 
          game_name: gameName, 
          mode: mode, 
          stock_quantity: Number(stockQuantity) 
        }
      ], { onConflict: 'game_name' })

    if (error) {
      alert('Erro ao atualizar configuração: ' + error.message)
    } else {
      alert('Configuração salva com sucesso!')
      setGameName('')
      setStockQuantity('')
      fetchData()
    }
  }

  return (
    <main style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Painel Administrativo - Coins</h1>
      <p><a href="/" style={{ color: '#0070f3' }}>← Voltar para a Loja</a></p>

      <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '30px', border: '1px solid #ddd' }}>
        <h2>Adicionar ou Atualizar Jogo / Modo</h2>
        <form onSubmit={handleUpdateConfig}>
          <div style={{ marginBottom: '15px' }}>
            <label>Nome do Jogo / Servidor:</label><br />
            <input 
              type="text" 
              value={gameName} 
              onChange={(e) => setGameName(e.target.value)} 
              placeholder="Ex: Pokepixel" 
              required 
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label>Modo de Operação:</label><br />
            <select 
              value={mode} 
              onChange={(e) => setMode(e.target.value)}
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            >
              <option value="selling">🟢 Vendendo Coins (Loja vende)</option>
              <option value="buying">🔴 Comprando de Usuários (Estoque esgotado)</option>
            </select>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label>Quantidade em Estoque:</label><br />
            <input 
              type="number" 
              value={stockQuantity} 
              onChange={(e) => setStockQuantity(e.target.value)} 
              placeholder="Ex: 5000" 
              required 
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </div>

          <button 
            type="submit" 
            style={{ background: '#28a745', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px' }}
          >
            Salvar / Atualizar Jogo
          </button>
        </form>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h2>Jogos Cadastrados</h2>
        {loading ? <p>Carregando...</p> : (
          <ul style={{ background: '#fff', border: '1px solid #ddd', borderRadius: '8px', padding: '20px' }}>
            {games.map((g) => (
              <li key={g.id} style={{ marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
                <strong>{g.game_name}</strong> — Modo: <code>{g.mode}</code> — Estoque: <strong>{g.stock_quantity}</strong>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h2>Transações / Solicitações Recentes</h2>
        {loading ? <p>Carregando...</p> : (
          <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', border: '1px solid #ddd' }}>
            <thead>
              <tr style={{ background: '#f1f1f1', textAlign: 'left' }}>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>ID</th>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Jogo</th>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Tipo</th>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Qtd</th>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Contato</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id}>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{tx.id}</td>
                  <td style={{ padding: '10px', border: '1px