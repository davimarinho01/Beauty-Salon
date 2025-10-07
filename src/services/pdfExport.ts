import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Estender o tipo jsPDF para incluir autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface RelatorioFuncionario {
  funcionario: any;
  totalServicos: number;
  faturamento: number;
  comissao: number;
  percentualMeta: number;
}

interface ServicoPopular {
  servico: any;
  quantidade: number;
  faturamento: number;
  percentual: number;
}

interface DadosRelatorio {
  periodo: string;
  dataInicio: Date;
  dataFim: Date;
  totalEntradas: number;
  totalSaidas: number;
  saldoLiquido: number;
  margemLucro: number;
  totalServicos: number;
  ticketMedio: number;
  crescimentoReceita: number;
  relatorioFuncionarios: RelatorioFuncionario[];
  servicosPopulares: ServicoPopular[];
  movimentacoes: any[];
}

export class PDFExportService {
  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  private formatDate(date: Date): string {
    return date.toLocaleDateString('pt-BR');
  }

  private formatPeriod(periodo: string): string {
    switch (periodo) {
      case 'hoje': return 'Hoje';
      case 'semana': return 'Última Semana';
      case 'mes': return 'Último Mês';
      case 'trimestre': return 'Último Trimestre';
      case 'ano': return 'Último Ano';
      default: return 'Último Mês';
    }
  }

  public async exportarRelatorio(dados: DadosRelatorio): Promise<void> {
    const doc = new jsPDF();
    
    // Configurações
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    let yPosition = margin;

    // Função para adicionar nova página se necessário
    const checkNewPage = (requiredSpace: number = 30) => {
      if (yPosition + requiredSpace > doc.internal.pageSize.height - margin) {
        doc.addPage();
        yPosition = margin;
        return true;
      }
      return false;
    };

    // Cabeçalho
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Beauty Salon Dashboard', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 10;
    doc.setFontSize(16);
    doc.text('Extrato Financeiro', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 15;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Período: ${this.formatPeriod(dados.periodo)}`, margin, yPosition);
    yPosition += 8;
    doc.text(`${this.formatDate(dados.dataInicio)} - ${this.formatDate(dados.dataFim)}`, margin, yPosition);
    
    yPosition += 15;

    // Resumo Financeiro
    checkNewPage(80);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Resumo Financeiro', margin, yPosition);
    yPosition += 15;

    // Tabela de resumo
    const resumoData = [
      ['Total de Receitas', this.formatCurrency(dados.totalEntradas)],
      ['Total de Despesas', this.formatCurrency(dados.totalSaidas)],
      ['Saldo Líquido', this.formatCurrency(dados.saldoLiquido)],
      ['Margem de Lucro', `${dados.margemLucro.toFixed(1)}%`],
      ['Serviços Realizados', dados.totalServicos.toString()],
      ['Ticket Médio', this.formatCurrency(dados.ticketMedio)],
      ['Crescimento', `${dados.crescimentoReceita >= 0 ? '+' : ''}${dados.crescimentoReceita.toFixed(1)}%`]
    ];

    autoTable(doc, {
      startY: yPosition,
      head: [['Métrica', 'Valor']],
      body: resumoData,
      theme: 'striped',
      headStyles: { fillColor: [232, 180, 203] }, // Rosa
      margin: { left: margin },
      tableWidth: pageWidth - (margin * 2)
    });

    yPosition = (doc as any).lastAutoTable.finalY + 20;

    // Desempenho por Funcionário
    if (dados.relatorioFuncionarios.length > 0) {
      checkNewPage(80);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Desempenho por Funcionário', margin, yPosition);
      yPosition += 15;

      const funcionariosData = dados.relatorioFuncionarios.map(rel => [
        `${rel.funcionario.nome} ${rel.funcionario.sobrenome}`,
        rel.funcionario.funcao,
        rel.totalServicos.toString(),
        this.formatCurrency(rel.faturamento),
        this.formatCurrency(rel.comissao),
        `${rel.percentualMeta.toFixed(0)}%`
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [['Funcionário', 'Função', 'Serviços', 'Faturamento', 'Comissão', 'Meta']],
        body: funcionariosData,
        theme: 'striped',
        headStyles: { fillColor: [232, 180, 203] },
        margin: { left: margin },
        tableWidth: pageWidth - (margin * 2),
        styles: { fontSize: 10 }
      });

      yPosition = (doc as any).lastAutoTable.finalY + 20;
    }

    // Serviços Mais Populares
    if (dados.servicosPopulares.length > 0) {
      checkNewPage(80);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Serviços Mais Populares', margin, yPosition);
      yPosition += 15;

      const servicosData = dados.servicosPopulares.map((servico, index) => [
        `#${index + 1}`,
        servico.servico.nome,
        servico.quantidade.toString(),
        this.formatCurrency(servico.faturamento),
        `${servico.percentual.toFixed(1)}%`
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [['Pos.', 'Serviço', 'Quantidade', 'Faturamento', '% Total']],
        body: servicosData,
        theme: 'striped',
        headStyles: { fillColor: [232, 180, 203] },
        margin: { left: margin },
        tableWidth: pageWidth - (margin * 2)
      });

      yPosition = (doc as any).lastAutoTable.finalY + 20;
    }

    // Últimas Movimentações
    if (dados.movimentacoes.length > 0) {
      checkNewPage(80);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Últimas Movimentações', margin, yPosition);
      yPosition += 15;

      const movimentacoesData = dados.movimentacoes
        .sort((a, b) => new Date(b.data_movimentacao).getTime() - new Date(a.data_movimentacao).getTime())
        .slice(0, 20) // Limitar a 20 para não sobrecarregar o PDF
        .map(mov => [
          this.formatDate(new Date(mov.data_movimentacao)),
          mov.tipo,
          mov.metodo_pagamento || 'N/A',
          mov.descricao,
          this.formatCurrency(mov.valor)
        ]);

      autoTable(doc, {
        startY: yPosition,
        head: [['Data', 'Tipo', 'Método', 'Descrição', 'Valor']],
        body: movimentacoesData,
        theme: 'striped',
        headStyles: { fillColor: [232, 180, 203] },
        margin: { left: margin },
        tableWidth: pageWidth - (margin * 2),
        styles: { fontSize: 9 }
      });
    }

    // Rodapé
    const totalPages = doc.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Página ${i} de ${totalPages}`,
        pageWidth - margin,
        doc.internal.pageSize.height - 10,
        { align: 'right' }
      );
      doc.text(
        `Gerado em ${new Date().toLocaleString('pt-BR')}`,
        margin,
        doc.internal.pageSize.height - 10
      );
    }

    // Salvar o arquivo
    const nomeArquivo = `extrato_${dados.periodo}_${this.formatDate(new Date()).replace(/\//g, '-')}.pdf`;
    doc.save(nomeArquivo);
  }
}

export const pdfExportService = new PDFExportService();
