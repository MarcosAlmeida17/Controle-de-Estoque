import{S as l,s as i}from"./main-WkKDY-kF.js";const y=10;let c=1,$=0,b="",h="todos",E=[],C=[];const g=document.querySelector("#tabela-produtos"),q=document.querySelector("#busca-produtos"),w=document.querySelector("#filtro-status-produtos"),N=document.querySelector("#info-paginacao-produtos"),x=document.querySelector("#pagina-anterior-produtos"),p=document.querySelector("#proxima-pagina-produtos"),S=document.querySelector("#btn-novo-produto"),I=document.querySelector("#total-produtos"),M=document.querySelector("#produtos-ativos"),F=document.querySelector("#produtos-inativos"),R=document.querySelector("#produtos-estoque-baixo"),T=new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"});function d(e){return String(e??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}function P(e){const t=Number(e);return Number.isFinite(t)?t:0}function z(e){return`<span class="rounded-full px-3 py-1 text-xs font-semibold ${e?"bg-green-100 text-green-700":"bg-slate-200 text-slate-700"}">${e?"Ativo":"Inativo"}</span>`}function O(e){var r,s;const t=e.estoque_atual<=e.estoque_minimo,o=e.ativo?"Inativar":"Reativar";return`
    <tr>
      <td class="border-t border-slate-200 font-medium">${d(e.codigo)}</td>
      <td class="border-t border-slate-200">${d(e.nome)}</td>
      <td class="border-t border-slate-200">${d(((r=e.categorias)==null?void 0:r.nome)||"-")}</td>
      <td class="border-t border-slate-200">${d(((s=e.fornecedores)==null?void 0:s.nome)||"-")}</td>
      <td class="border-t border-slate-200 ${t?"font-semibold text-red-600":""}">${e.estoque_atual}</td>
      <td class="border-t border-slate-200">${T.format(P(e.preco_venda))}</td>
      <td class="border-t border-slate-200">${z(e.ativo)}</td>
      <td class="border-t border-slate-200">
        <div class="flex flex-wrap gap-2">
          <button class="btn-secondary" data-editar-produto="${e.id}">Editar</button>
          <button class="btn-secondary" data-alternar-produto="${e.id}" data-ativo="${e.ativo}">${o}</button>
        </div>
      </td>
    </tr>
  `}function H(e){if(!e.length){g.innerHTML='<tr><td colspan="8" class="border-t border-slate-200 text-center text-slate-500">Nenhum produto encontrado.</td></tr>';return}g.innerHTML=e.map(O).join("")}function j(){const e=Math.max(1,Math.ceil($/y));N.textContent=`Página ${c} de ${e} • ${$} registro(s)`,x.disabled=c<=1,p.disabled=c>=e}async function D(){try{const[{count:e},{count:t},{count:o},r]=await Promise.all([i.from("produtos").select("id",{count:"exact"}),i.from("produtos").select("id",{count:"exact"}).eq("ativo",!0),i.from("produtos").select("id",{count:"exact"}).eq("ativo",!1),i.from("produtos").select("estoque_atual,estoque_minimo,ativo")]);I.textContent=String(e??0),M.textContent=String(t??0),F.textContent=String(o??0);const n=(r.data??[]).reduce((a,u)=>{const _=u.ativo===!0||String(u.ativo)==="true",v=Number(u.estoque_atual)||0,k=Number(u.estoque_minimo)||0;return a+(_&&v<k?1:0)},0);R.textContent=String(n)}catch(e){console.error("Falha ao carregar resumo de produtos:",e.message)}}async function m(){try{const e=(c-1)*y,t=e+y-1;let o=i.from("produtos").select("id,codigo,nome,descricao,preco_custo,preco_venda,estoque_atual,estoque_minimo,ativo,categorias(nome),fornecedores(nome)",{count:"exact"}).order("nome",{ascending:!0}).range(e,t);b&&(o=o.or(`nome.ilike.%${b}%,codigo.ilike.%${b}%`)),h==="ativos"&&(o=o.eq("ativo",!0)),h==="inativos"&&(o=o.eq("ativo",!1));const{data:r,error:s,count:n}=await o;if(s)throw s;$=n??0,H(r??[]),j(),await D()}catch(e){await l.fire({icon:"error",title:"Erro ao carregar produtos",text:e.message})}}async function V(e){const{data:t,error:o}=await i.from("produtos").select("*,categorias(nome),fornecedores(nome)").eq("id",e).single();if(o)throw o;return t}function f(e,t,o,r="",s=""){return`
    <label class="block text-left text-sm font-medium text-slate-600">
      ${t}
      <input id="${e}" type="${o}" value="${d(r)}" ${s} class="mt-2 w-full" />
    </label>
  `}function A(e,t,o,r="",s=!1){const n=o.map(a=>`
      <option value="${a.id}"${a.id===r?" selected":""}>${d(a.nome)}</option>`).join("");return`
    <label class="block text-left text-sm font-medium text-slate-600">
      ${t}
      <select id="${e}" class="mt-2 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900" ${s?"required":""}>
        <option value="">Selecione...</option>
        ${n}
      </select>
    </label>
  `}async function G(){const{data:e,error:t}=await i.from("categorias").select("id,nome").eq("ativo",!0).order("nome",{ascending:!0});if(t)throw t;E=e??[]}async function U(){const{data:e,error:t}=await i.from("fornecedores").select("id,nome").eq("ativo",!0).order("nome",{ascending:!0});if(t)throw t;C=e??[]}async function B(){await Promise.all([G(),U()])}async function L(e=null){const t=!!e;(!E.length||!C.length)&&await B();const o=(e==null?void 0:e.categoria_id)||"",r=(e==null?void 0:e.fornecedor_id)||"",s=`
    <div class="grid gap-3 md:grid-cols-2">
      ${f("swal-codigo","Código","text",e==null?void 0:e.codigo,"required")}
      ${f("swal-nome","Nome","text",e==null?void 0:e.nome,"required")}
      ${A("swal-categoria","Categoria",E,o,!0)}
      ${A("swal-fornecedor","Fornecedor",C,r)}
      ${f("swal-preco-custo","Preço de custo","number",(e==null?void 0:e.preco_custo)??0,'min="0" step="0.01"')}
      ${f("swal-preco-venda","Preço de venda","number",(e==null?void 0:e.preco_venda)??0,'min="0" step="0.01"')}
      ${f("swal-estoque-atual","Estoque atual","number",(e==null?void 0:e.estoque_atual)??0,'min="0" step="1"')}
      ${f("swal-estoque-minimo","Estoque mínimo","number",(e==null?void 0:e.estoque_minimo)??0,'min="0" step="1"')}
    </div>
    <label class="mt-3 block text-left text-sm font-medium text-slate-600">
      Descrição
      <textarea id="swal-descricao" rows="3" class="mt-2 w-full">${d((e==null?void 0:e.descricao)||"")}</textarea>
    </label>
  `,n=await l.fire({title:t?"Editar produto":"Novo produto",html:s,width:760,showCancelButton:!0,confirmButtonText:t?"Salvar alterações":"Cadastrar produto",cancelButtonText:"Cancelar",focusConfirm:!1,preConfirm:()=>{const a={codigo:document.querySelector("#swal-codigo").value.trim(),nome:document.querySelector("#swal-nome").value.trim(),categoria_id:document.querySelector("#swal-categoria").value,fornecedor_id:document.querySelector("#swal-fornecedor").value||null,preco_custo:P(document.querySelector("#swal-preco-custo").value),preco_venda:P(document.querySelector("#swal-preco-venda").value),estoque_atual:Number.parseInt(document.querySelector("#swal-estoque-atual").value,10),estoque_minimo:Number.parseInt(document.querySelector("#swal-estoque-minimo").value,10),descricao:document.querySelector("#swal-descricao").value.trim()};return!a.codigo||!a.nome||!a.categoria_id?(l.showValidationMessage("Informe código, nome e categoria."),!1):a.estoque_atual<0||a.estoque_minimo<0?(l.showValidationMessage("Estoque atual e mínimo não podem ser negativos."),!1):a}});if(n.isConfirmed)try{const a=n.value,u={codigo:a.codigo,nome:a.nome,descricao:a.descricao||null,categoria_id:a.categoria_id,fornecedor_id:a.fornecedor_id,preco_custo:a.preco_custo,preco_venda:a.preco_venda,estoque_atual:a.estoque_atual,estoque_minimo:a.estoque_minimo},_=t?i.from("produtos").update(u).eq("id",e.id):i.from("produtos").insert(u),{error:v}=await _;if(v)throw v;await l.fire({icon:"success",title:"Produto salvo",text:"O cadastro foi atualizado com sucesso."}),await m()}catch(a){await l.fire({icon:"error",title:"Erro ao salvar produto",text:a.message})}}async function Z(e,t){const o=!t,r=o?"reativar":"inativar";if((await l.fire({icon:"question",title:`${r.charAt(0).toUpperCase()+r.slice(1)} produto?`,text:o?"O produto voltará a aceitar movimentações.":"Produtos inativos não podem receber movimentações.",showCancelButton:!0,confirmButtonText:o?"Reativar":"Inativar",cancelButtonText:"Cancelar"})).isConfirmed)try{const{error:n}=await i.from("produtos").update({ativo:o}).eq("id",e);if(n)throw n;await l.fire({icon:"success",title:"Status atualizado",text:"O produto foi atualizado com sucesso."}),await m()}catch(n){await l.fire({icon:"error",title:"Erro ao atualizar status",text:n.message})}}function J(){S==null||S.addEventListener("click",()=>L()),q==null||q.addEventListener("input",()=>{b=q.value.trim(),c=1,m()}),w==null||w.addEventListener("change",()=>{h=w.value,c=1,m()}),x==null||x.addEventListener("click",()=>{c>1&&(c-=1,m())}),p==null||p.addEventListener("click",()=>{c<Math.ceil($/y)&&(c+=1,m())}),g==null||g.addEventListener("click",async e=>{const t=e.target.closest("[data-editar-produto]"),o=e.target.closest("[data-alternar-produto]");if(t)try{const r=await V(t.dataset.editarProduto);await L(r)}catch(r){await l.fire({icon:"error",title:"Erro ao buscar produto",text:r.message})}o&&await Z(o.dataset.alternarProduto,o.dataset.ativo==="true")})}window.addEventListener("DOMContentLoaded",async()=>{J(),await B(),m()});
