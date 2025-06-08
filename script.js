const obraInput = document.getElementById("obraInput");
const adicionarBtn = document.getElementById("adicionarBtn");
const tabela = document.querySelector("#tabela tbody");
const motorista = "Lucas";

const filtroObra = document.getElementById("filtroObra");
const filtroData = document.getElementById("filtroData");

adicionarBtn.addEventListener("click", () => {
  const obra = obraInput.value.trim();
  if (!obra) return;

  const agora = new Date();
  const data = agora.toLocaleDateString();
  const hora = agora.toLocaleTimeString();

  adicionarLinha(data, hora, obra, motorista);
  obraInput.value = "";
  salvarTabelaNoLocalStorage();
});

function adicionarLinha(data, hora, obra, motorista) {
  const novaLinha = document.createElement("tr");
  novaLinha.innerHTML = `
    <td>${data}</td>
    <td>${hora}</td>
    <td>${obra}</td>
    <td>${motorista}</td>
    <td><button class="excluir-btn">Excluir</button></td>
  `;

  const mensagem = `Estou na obra: ${obra}`;
  const numero = "5577991214377"; // Substitua pelo número desejado (com DDI e DDD, sem + ou espaços)
  const urlWhatsApp = `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
  window.open(urlWhatsApp, "_blank");


  novaLinha.querySelector(".excluir-btn").addEventListener("click", () => {
    novaLinha.remove();
    salvarTabelaNoLocalStorage();
  });

  tabela.appendChild(novaLinha);
}

function salvarTabelaNoLocalStorage() {
  const linhas = Array.from(tabela.querySelectorAll("tr")).map(tr => {
    return Array.from(tr.children).slice(0, 4).map(td => td.textContent);
  });
  localStorage.setItem("tabelaObras", JSON.stringify(linhas));
}

function carregarTabelaDoLocalStorage() {
  const dados = JSON.parse(localStorage.getItem("tabelaObras") || "[]");
  dados.forEach(([data, hora, obra, motorista]) => {
    adicionarLinha(data, hora, obra, motorista);
  });
}

document.getElementById("exportExcel").addEventListener("click", () => {
  const wb = XLSX.utils.book_new();
  const dados = [["Data", "Hora", "Obra", "Motorista"]];

  tabela.querySelectorAll("tr").forEach(tr => {
    const linha = Array.from(tr.children).slice(0, 4).map(td => td.textContent);
    dados.push(linha);
  });

  const ws = XLSX.utils.aoa_to_sheet(dados);
  XLSX.utils.book_append_sheet(wb, ws, "Registros");
  XLSX.writeFile(wb, "registro_obras.xlsx");
});

document.getElementById("exportPDF").addEventListener("click", () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.setFontSize(14);
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.text("Diário da Montana", pageWidth / 2, 10, { align: "center" });


  const headers = [["Data", "Hora", "Obra", "Motorista"]];
  const rows = Array.from(document.querySelectorAll("#tabela tbody tr")).map(tr =>
    Array.from(tr.children).slice(0, 4).map(td => td.textContent)
  );

  doc.autoTable({
    head: headers,
    body: rows,
    startY: 20,
    styles: { fontSize: 10, cellPadding: 2 },
    theme: 'grid'
  });

  doc.save("registro_obras.pdf");
});


filtroObra.addEventListener("input", aplicarFiltros);
filtroData.addEventListener("input", aplicarFiltros);

function aplicarFiltros() {
  const filtroObraValor = filtroObra.value.toLowerCase();
  const filtroDataValor = filtroData.value;

  tabela.querySelectorAll("tr").forEach(tr => {
    const [data, _, obra] = Array.from(tr.children).map(td => td.textContent.toLowerCase());
    const correspondeObra = obra.includes(filtroObraValor);
    const correspondeData = !filtroDataValor || data.includes(new Date(filtroDataValor).toLocaleDateString());
    tr.style.display = correspondeObra && correspondeData ? "" : "none";
  });
}

// Abas
document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));

    tab.classList.add("active");
    document.getElementById(tab.dataset.tab).classList.add("active");

    if (tab.dataset.tab === "historico") {
      mostrarHistorico();
    }
  });
});

function mostrarHistorico() {
  const historico = JSON.parse(localStorage.getItem("tabelaObras") || "[]");
  const container = document.getElementById("historicoContainer");
  container.innerHTML = "";
  historico.forEach(([data, hora, obra, motorista], i) => {
    const div = document.createElement("div");
    div.innerHTML = `${data} | ${hora} | ${obra} | ${motorista} <button onclick="removerHistorico(${i})">Excluir</button>`;
    container.appendChild(div);
  });
}

function removerHistorico(index) {
  const historico = JSON.parse(localStorage.getItem("tabelaObras") || "[]");
  historico.splice(index, 1);
  localStorage.setItem("tabelaObras", JSON.stringify(historico));
  mostrarHistorico();
}

document.getElementById("limparHistorico").addEventListener("click", () => {
  if (confirm("Tem certeza que deseja apagar todo o histórico?")) {
    localStorage.removeItem("tabelaObras");
    document.querySelector("#tabela tbody").innerHTML = "";
    mostrarHistorico();
  }
});

carregarTabelaDoLocalStorage();
