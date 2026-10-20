const geometriaChao = new THREE.PlaneGeometry(

    100,

    100

);

// Material da grama

const materialChao = new THREE.MeshStandardMaterial({

    color: 0x4caf50,

    roughness: 1

});

// Criar o chão

const chao = new THREE.Mesh(

    geometriaChao,

    materialChao

);

// Deitar o plano para formar o chão

chao.rotation.x = -Math.PI / 2;

// Posicionar no nível do solo

chao.position.y = 0;

// Receber sombras

chao.receiveShadow = true;

// Adicionar à cena

cena.add(chao);

function criarArvore(x, z) {

    // Tronco

    const geometriaTronco = new THREE.CylinderGeometry(

        0.2,

        0.3,

        1.5,

        8

    );

    const materialTronco = new THREE.MeshStandardMaterial({

        color: 0x795548

    });

    const tronco = new THREE.Mesh(

        geometriaTronco,

        materialTronco

    );

    tronco.position.set(

        x,

        0.75,

        z

    );

    tronco.castShadow = true;

    tronco.receiveShadow = true;

    cena.add(tronco);


    // Copa da árvore

    const geometriaCopa = new THREE.ConeGeometry(

        1.2,

        2.5,

        8

    );

    const materialCopa = new THREE.MeshStandardMaterial({

        color: 0x2e7d32

    });

    const copa = new THREE.Mesh(

        geometriaCopa,

        materialCopa

    );

    copa.position.set(

        x,

        2.5,

        z

    );

    copa.castShadow = true;

    cena.add(copa);

}


// Criar árvores nas bordas do cenário

for (let i = -40; i <= 40; i += 10) {

    criarArvore(i, -35);

    criarArvore(i, 35);

    criarArvore(-35, i);

    criarArvore(35, i);

}function criarPedra(x, z) {


    const geometria = new THREE.DodecahedronGeometry(


        0.5,


        0


    );


    const material = new THREE.MeshStandardMaterial({


        color: 0x808080,


        roughness: 1


    });


    const pedra = new THREE.Mesh(


        geometria,


        material


    );


    pedra.position.set(


        x,


        0.3,


        z


    );


    pedra.rotation.set(


        Math.random(),


        Math.random(),


        Math.random()


    );


    pedra.castShadow = true;


    pedra.receiveShadow = true;


    cena.add(pedra);


}



// Distribuir pedras pelo campo


for (let i = 0; i < 25; i++) {


    const x = Math.random() * 50 - 25;


    const z = Math.random() * 50 - 25;


    criarPedra(x, z);


}

// Grupo que controla a posição e a direção do personagem


const personagem = new THREE.Group();


cena.add(personagem);



// Posição inicial


personagem.position.set(0, 0, 0);



// Variáveis do modelo


let modeloCarregado = false;


let mixer = null;



// Carregador de modelos comprimidos com Draco


const dracoLoader = new DRACOLoader();


dracoLoader.setDecoderPath(
    'https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/libs/draco/'
);


// Carregador de modelos 3D


const carregador = new GLTFLoader();


carregador.setDRACOLoader(dracoLoader);



// Importar o arquivo GLB


carregador.load(


    './assets/personagem.glb',
    


    function (gltf) {


        const modelo = gltf.scene;



        // Calcular o tamanho original do modelo


        const caixaInicial = new THREE.Box3()


            .setFromObject(modelo);



        const tamanhoInicial = new THREE.Vector3();


        caixaInicial.getSize(tamanhoInicial);



        // Ajustar a escala automaticamente


        const maiorDimensao = Math.max(


            tamanhoInicial.x,


            tamanhoInicial.y,


            tamanhoInicial.z


        );



        if (maiorDimensao > 0) {


            const escala = 1.8 / maiorDimensao;


            modelo.scale.setScalar(escala);


        }



        // Centralizar o modelo horizontalmente


        const centroInicial = new THREE.Box3()


            .setFromObject(modelo)


            .getCenter(new THREE.Vector3());



        modelo.position.x -= centroInicial.x;


        modelo.position.z -= centroInicial.z;



        // Ajustar os pés ao nível do chão


        const caixaFinal = new THREE.Box3()


            .setFromObject(modelo);



        modelo.position.y -= caixaFinal.min.y;



        // Configurar sombras


        modelo.traverse(function (objeto) {


            if (objeto.isMesh) {


                objeto.castShadow = true;


                objeto.receiveShadow = true;


            }


        });



        // Adicionar o modelo ao personagem


        personagem.add(modelo);



        // Preparar animações, caso o arquivo possua alguma


        if (gltf.animations.length > 0) {


            mixer = new THREE.AnimationMixer(modelo);


            const animacao = mixer.clipAction(


                gltf.animations[0]


            );


            animacao.play();


        }



        modeloCarregado = true;



        mensagem.style.display = 'none';


        status.textContent = 'Explore o campo!';



        console.log('Personagem carregado com sucesso!');


    },


    function (progresso) {


        if (progresso.total > 0) {


            const porcentagem = Math.round(


                progresso.loaded / progresso.total * 100


            );


            mensagem.textContent =


                `Carregando personagem: ${porcentagem}%`;


        }


    },


    undefined,


    function (erro) {


        console.error(


            'Erro ao carregar o personagem:',


            erro


        );


        mensagem.textContent =


            'Não foi possível carregar o personagem. ' +


            'Verifique o arquivo assets/personagem.glb.';


        status.textContent = 'Erro ao carregar o modelo';


    }


);


const velocidade = 6;


// Limites do campo

const limiteCampo = 30;


// Vetor para a direção do movimento

const direcao = new THREE.Vector3();

const alvoCamera = new THREE.Vector3();

const relogio = new THREE.Clock();


function animar() {

    requestAnimationFrame(animar);


    // Calcular o tempo transcorrido

    const delta = Math.min(

        relogio.getDelta(),

        0.05

    );


    // Atualizar animações do modelo

    if (mixer) {

        mixer.update(delta);

    }


    // ==================================================
    // MOVIMENTAR O PERSONAGEM
    // ==================================================

    if (modeloCarregado) {

        // Zerar a direção antes de calcular o movimento

        direcao.set(0, 0, 0);


        // Movimentação horizontal

        if (

            teclas['w'] ||

            teclas['arrowup']

        ) {

            direcao.z -= 1;

        }


        if (

            teclas['s'] ||

            teclas['arrowdown']

        ) {

            direcao.z += 1;

        }


        // Movimentação lateral

        if (

            teclas['a'] ||

            teclas['arrowleft']

        ) {

            direcao.x -= 1;

        }


        if (

            teclas['d'] ||

            teclas['arrowright']

        ) {

            direcao.x += 1;

        }


        // Verificar se existe movimento

        if (direcao.lengthSq() > 0) {

            // Normalizar evita que a diagonal
            // seja mais rápida que o movimento reto

            direcao.normalize();


            // Movimentar o personagem

            personagem.position.x +=

                direcao.x * velocidade * delta;


            personagem.position.z +=

                direcao.z * velocidade * delta;


            // Girar o personagem na direção do movimento

            personagem.rotation.y = Math.atan2(

                direcao.x,

                direcao.z

            );

        }


        // Impedir que o personagem saia do campo

        personagem.position.x = THREE.MathUtils.clamp(

            personagem.position.x,

            -limiteCampo,

            limiteCampo

        );


        personagem.position.z = THREE.MathUtils.clamp(

            personagem.position.z,

            -limiteCampo,

            limiteCampo

        );


        // ==================================================
        // CÂMERA QUE ACOMPANHA O PERSONAGEM
        // ==================================================

        // Definir onde a câmera deve ficar

        const posicaoDesejada = new THREE.Vector3(

            personagem.position.x,

            personagem.position.y + 6,

            personagem.position.z + 9

        );


        // Movimento suave da câmera

        camera.position.lerp(

            posicaoDesejada,

            1 - Math.exp(-4 * delta)

        );


        // Definir o ponto que a câmera observa

        alvoCamera.set(

            personagem.position.x,

            personagem.position.y + 1,

            personagem.position.z

        );


        camera.lookAt(alvoCamera);

    }


    // ==================================================
    // DESENHAR A CENA
    // ==================================================

    renderer.render(

        cena,

        camera

    );

}


// Iniciar o jogo

animar();


window.addEventListener('resize', function () {

    const largura = areaJogo.clientWidth;

    const altura = areaJogo.clientHeight;


    // Atualizar proporção da câmera

    camera.aspect = largura / altura;

    camera.updateProjectionMatrix();


    // Redimensionar o renderizador

    renderer.setSize(

        largura,

        altura

    );

});