0 - p1 - Criar classes e relacionamentos das intenções de compra. Ao criar efetivado, deverá ser criado registro de compra

Criar domínio 
{
  "id": "79b6c9b3-460b-4655-846a-77e8df2f42a1",
  "produto": {
    "nome": "PlayStation 5 Slim",
    "descricao": "Edição Digital com 1TB SSD",
    "marca": "Sony",
    "modelo": "CFI-2000",
    "ano": 2023,
    "observacao": "Versão nacional",
    "ehNovo": true
  },
  "cotacoes": [
    {
      "id": "cot_01j1a2b3",
      "data": "2026-05-11T10:15:00Z",
      "valor": 3200.00,
      "link": "olx.com",
      "contato": "Lucas WhatsApp",
      "observacao": "Anúncio de lote com 5 unidades disponíveis"
    }
  ],
  "efetivados": [
    {
      "codUnitario": "PS5-SLIM-001",
      "cotacaoId": "cot_01j1a2b3",
      "valorCompra": 3100.00,
      "dataCompra": "2026-05-12T14:00:00Z",
      "status": "VENDIDO",
      "venda": {
        "valorVenda": 3990.00,
        "dataVenda": "2026-05-20T18:30:00Z",
        "lucroLiquido": 890.00
      }
    },
    {
      "codUnitario": "PS5-SLIM-002",
      "cotacaoId": "cot_01j1a2b3",
      "valorCompra": 3100.00,
      "dataCompra": "2026-05-12T14:00:00Z",
      "status": "EM_ESTOQUE",
      "venda": null
    }
  ]
}
