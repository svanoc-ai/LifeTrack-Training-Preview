/** Libellés de présentation uniquement : les identifiants anatomiques persistés restent inchangés. */
export const ANATOMY_LABELS:Record<string,string>={
 pectoralis_clavicular:'Grand pectoral — faisceau claviculaire',pectoralis_sternocostal:'Grand pectoral — faisceau sternocostal',
 latissimus:'Grand dorsal',rhomboids:'Rhomboïdes',trapezius:'Trapèze',teres_major:'Grand rond',spinal_erectors:'Érecteurs du rachis',
 deltoid_anterior:'Deltoïde antérieur',deltoid_lateral:'Deltoïde moyen',deltoid_posterior:'Deltoïde postérieur',
 biceps_brachii:'Biceps brachial',brachialis:'Brachial',brachioradialis:'Brachio-radial',
 triceps_long:'Triceps — longue portion',triceps_lateral:'Triceps — vaste latéral',triceps_medial:'Triceps — vaste médial',
 rectus_abdominis:'Grand droit de l’abdomen',transversus:'Transverse de l’abdomen',obliques:'Obliques',quadratus_lumborum:'Carré des lombes',
 gluteus_maximus:'Grand fessier',gluteus_medius:'Moyen fessier',gluteus_minimus:'Petit fessier',
 rectus_femoris:'Droit fémoral',vastus_medialis:'Vaste médial',vastus_lateralis:'Vaste latéral',vastus_intermedius:'Vaste intermédiaire',
 biceps_femoris:'Biceps fémoral',semitendinosus:'Semi-tendineux',semimembranosus:'Semi-membraneux',
 adductor_magnus:'Grand adducteur',adductor_longus:'Long adducteur',adductor_brevis:'Court adducteur',gracilis:'Gracile',
 tensor_fasciae_latae:'Tenseur du fascia lata',gastrocnemius:'Gastrocnémien',soleus:'Soléaire'
};
export const anatomyLabel=(id:string)=>ANATOMY_LABELS[id]??id.replaceAll('_',' ');
