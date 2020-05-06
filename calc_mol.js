"use strict";

// const atomicTable={
    // "source": "http://www.chemistry.or.jp/activity/atomicTable2020.pdf#page=4",
    // "H":1.008,
    // "He":4.003,
    // "Li":6.941,
    // "Be":9.012,
    // "B":10.81,
    // "C":12.01,
    // "N":14.01,
    // "O":16.00,
    // "F":19.00,
    // "Ne":20.18,
    // "Na":22.99,
    // "Mg":24.31,
    // "Al":26.98,
    // "Si":28.09,
    // "P":30.97,
    // "S":32.07,
    // "Cl":35.45,
    // "Ar":39.95,
    // "K":39.10,
    // "Ca":40.08,
    // "Sc":44.96,
    // "Ti":47.87,
    // "V":50.94,
    // "Cr":52.00,
    // "Mn":54.94,
    // "Fe":55.85,
    // "Co":58.93,
    // "Ni":58.69,
    // "Cu":63.55,
    // "Zn":65.38,
    // "Ga":69.72,
    // "Ge":72.63,
    // "As":74.92,
    // "Se":78.97,
    // "Br":79.90,
    // "Kr":83.80,
    // "Rb":85.47,
    // "Sr":87.62,
    // "Y":88.91,
    // "Zr":91.22,
    // "Nb":92.91,
    // "Mo":95.95,
    // "Tc":99,
    // "Ru":101.1,
    // "Rh":102.9,
    // "Pd":106.4,
    // "Ag":107.9,
    // "Cd":112.4,
    // "In":114.8,
    // "Sn":118.7,
    // "Sb":121.8,
    // "Te":127.6,
    // "I":126.9,
    // "Xe":131.3,
    // "Cs":132.9,
    // "Ba":137.3,
    // "La":138.9,
    // "Ce":140.1,
    // "Pr":140.9,
    // "Nd":144.2,
    // "Pm":145,
    // "Sm":150.4,
    // "Eu":152.0,
    // "Gd":157.3,
    // "Tb":158.9,
    // "Dy":162.5,
    // "Ho":164.9,
    // "Er":167.3,
    // "Tm":168.9,
    // "Yb":173.0,
    // "Lu":175.0,
    // "Hf":178.5,
    // "Ta":180.9,
    // "W":183.8,
    // "Re":186.2,
    // "Os":190.2,
    // "Ir":192.2,
    // "Pt":195.1,
    // "Au":197.0,
    // "Hg":200.6,
    // "Tl":204.4,
    // "Pb":207.2,
    // "Bi":209.0,
    // "Po":210,
    // "At":210,
    // "Rn":222,
    // "Fr":223,
    // "Ra":226,
    // "Ac":227,
    // "Th":232.0,
    // "Pa":231.0,
    // "U":238.0,
    // "Np":237,
    // "Pu":239,
    // "Am":243,
    // "Cm":247,
    // "Bk":247,
    // "Cf":252,
    // "Es":252,
    // "Fm":257,
    // "Md":258,
    // "No":259,
    // "Lr":262,
    // "Rf":267,
    // "Db":268,
    // "Sg":271,
    // "Bh":272,
    // "Hs":277,
    // "Mt":276,
    // "Ds":281,
    // "Rg":280,
    // "Cn":285,
    // "Nh":278,
    // "Fl":289,
    // "Mc":289,
    // "Lv":293,
    // "Ts":293,
    // "Og":294
// };
const braL=/[[({]/;
const braR=/[\])}]/;

const atomicWeightSource=document.getElementById('atomicWeight');
const compoundFormula=document.getElementById('compoundFormula');
const outputCompoundWeight=document.getElementById('outputCompoundWeight');
const chemicalEquation=document.getElementById('chemicalEquation');
const outputChemicalEquation=document.getElementById('outputChemicalEquation');

const httpObj=new XMLHttpRequest();
let atomicTable;
httpObj.open("get","https://ti631.github.io/calcMol/atomicWeight.json");
httpObj.responseType="json";
httpObj.onload=function(){
    atomicTable=JSON.parse(this.response);
    console.log("OK JSON");
}
httpObj.send();

atomicWeightSource.href=atomicTable.source;
window.onload=()=>{calcCompound(); calcEquation();}

// for compound
const calcCompound=()=>outputCompoundWeight.value=calcFormulaWeight("("+compoundFormula.value.replace(/\./,")(")+")");
const calcFormulaWeight=formula=>{
    const len=formula.length;
    let sumWeight=0;
    let iStart=0;
    let coef;
    if((coef=/^[0-9]+/.exec(formula))==null){
        coef=1;
    }else{
        iStart=coef.length;
        coef=parseInt(coef);
    }
    for(let i=iStart;i<len;i++){
        let atom="";
        if(/[A-Z]/.test(formula[i])){
            atom+=formula[i];
            while(/[a-z0-9]/.test(formula[i+1])&&i+1<len){
                atom+=formula[i+1];
                i++;
            }
            sumWeight+=decompose2Atoms(atom);
        }else if(braL.test(formula[i])){
            let nBra=1;
            while(nBra>0&&i+1<len){
                if(braR.test(formula[i+1])){
                    nBra--;
                    if(nBra>0) atom+=formula[i+1];
                }else if(braL.test(formula[i+1])){
                    nBra++;
                    atom+=formula[i+1];
                }else{
                    atom+=formula[i+1];
                }
                i++;
            }
            let coef2="";
            while(/[0-9]/.test(formula[i+1])&&i+1<len){
                coef2+=formula[i+1];
                i++;
            }
            coef2=(coef2==="" ? 1 : parseInt(coef2));
            sumWeight+=coef2*calcFormulaWeight(atom);
        }else{
            console.log("undefined:",formula[i]);
        }
    }
    return coef*sumWeight;
}
const decompose2Atoms=(formula)=>{
    const atoms=formula.split(/([A-Z][a-z]?\d*)/).filter(e => e!=="");
    const coef=(isFinite(atoms[0]) ? atoms[0] : 1);
    return coef*atoms.slice(coef>1 ? 1 : 0).reduce((sum,e)=>sum+calcWeight(e.split(/(\d+)/).filter(e=>e!=="")),0);
}
const calcWeight=(atom)=>(atom.length===2?atomicTable[atom[0]]*atom[1]:atomicTable[atom]);

// for chemical equation
const calcEquation=()=>outputChemicalEquation.value=calcEquationCoef(chemicalEquation.value.replace(/\s*[+,]\s*/g,"").split("="));
const calcEquationCoef=(equation)=>{
    let [left,right]=equation;
    let i,atom;
    let atoms=new Map();
    left=left.split(/([A-Z][a-z]?[0-9]*)/).filter(e=>e!=="");
    for(i=0;i<left.length;i++){
        if(/[A-Za-z]+[0-9]*/.test(left[i])){
            atoms.set(atom=/[A-Za-z]+/.exec(left[i])[0], atoms.has(atom) ? atoms.get(atom)+1 : 1);
        }
    }
    console.log(left,"=",right,",",atoms);
}
