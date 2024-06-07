# <center> Reconocedor de emociones </center>

El proposito de este proyecto era crear un modelo capaz de reconcer las emciones de una persona entre las cuales estan enojo, alegría y sorpresa.

Este proyecto se divide en 3 partes:
1. Crear DataSet
2. Entrenar modelo
3. Probar modelo

Primero que nada comenzaremos con las librearías que se usan a lo largo de las 3 partes del código, las cuales son:
### Librerías:
~~~
import cv2 as cv
import os
import imutils
import numpy as np
import time
~~~

Ahora comenzaremos a explicar cada una de las partes del código.

## Crear DataSet
En esta parte el objetivo es generar imagenes representando las emociones que se busca poder reconocer a la hora de probar el metodo, para crear el dataSet lo hice de dos formas, utilizando directamente la cámara y usando videos.

Comenzare explicando que utilice la variable __sexo__ que tenía dos valores __H__ para hombres y __M__ para mujeres, la variable __persona__ para darle un nombre a las imagenes de ese dataSet antes de combinarlas y así ordenarlo de una mejor forma a mi manera de verlo, por ultimo la variable __emocion__ que tenía las variables enojo, alegría y sorprendio, claramente se le pueden asignar más valores dependiendo de las emociones que se necesiten reconocer, en este caso esas eran las necesarias, tambein es importante mencionar que es necesario utilizar el archivo __haarcascade_frontalface_default.xml__ para detectar el rostro de la persona y poder sacar las imagenes que conforman el dataSet de una forma más fácil, aclarando el uso de estas variables y del archivo .xml, el código usado es el practicamente el mismo solo cambia en una línea, de igual forma el código usado para crear el dataSet es el siguiente:
~~~
#Carpeta donde se almacenara el dataSet
dataPath = 'C:\\Users\\israe\\IA (Ahora si)\\Reconocedor de emociones\\DataSetEmociones\\'
emocionPath = dataPath + '\\'+ sexo + '\\' + persona + '\\' + emocion

#Comprueba si esxite la ruta o si se necesita crear
if not os.path.exists(emocionPath):
	print('Carpeta creada: ',emocionPath)
	os.makedirs(emocionPath)
    

# cap = cv.VideoCapture(0,cv.CAP_DSHOW)
cap = cv.VideoCapture('C:\\Users\\israe\\IA (Ahora si)\\Reconocedor de emociones\\VideosCaras\\MemoSorprendido.mp4')

faceClassif = cv.CascadeClassifier(cv.data.haarcascades+'haarcascade_frontalface_default.xml')
count = 1

while True:

	ret, frame = cap.read()
	if ret == False: break
	frame =  imutils.resize(frame, width=640)
	gray = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)
	auxFrame = frame.copy()

	faces = faceClassif.detectMultiScale(gray,1.3,5)

	for (x,y,w,h) in faces:
		cv.rectangle(frame, (x,y),(x+w,y+h),(0,255,0),2)
		rostro = auxFrame[y:y+h,x:x+w]
		rostro = cv.resize(rostro,(150,150),interpolation=cv.INTER_CUBIC)
		cv.imwrite(emocionPath + '\\{}_{}.jpg'.format(emocion, 
                                                     count),rostro)
		count = count + 1
        
	cv.imshow('frame',frame)

	k =  cv.waitKey(1)
	if k == 27 or count >= 350:
		break

cap.release()
cv.destroyAllWindows()
~~~

Lo importante a destacar entre que define la forma de crear las imagenes ya sea con cámara o por medio de un video son las siguientes líneas del código:
~~~
cap = cv.VideoCapture(0,cv.CAP_DSHOW)
cap = cv.VideoCapture('C:\\Users\\israe\\IA (Ahora si)\\Reconocedor de emociones\\VideosCaras\\MemoSorprendido.mp4')
~~~
La primera línea es la que se utiliza es la que nos sirve para realizar la captura de imagenes por medio de la cámara y la segunda por medio de los videos, la cuál requiere agregar la ruta donde se encuentra almacenado el video, solo se necesita comentar la forma que no se desea utilizar.

Una vez se hayan obtenido todas las imagenes necesarias para poder entrenar el modelo se necesita juntar todas las fotos de la misma emoción en una sola, o sea alegría con alegría, sorpresa con sorpresa y enojo con enojo, estás imagenes gracias al archivo __haarcascade_frontalfece__ suelen tener las mismas dimensiones por lo cual no se requiere redimencionar.

Para este dataSet cree una carpeta correspondiente a cada emoxión y junte todas las imagenes, yo tulice imagenes de 3 mujeres y 3 de hombres, en este caso yo utlice 7,459 imagenes en total siendo una cantidad de:
- Alegría: 2,499 imagenes
- Enojo: 2,499 imagenes
- Sorpresa: 2461 imagenes

## Entrenar modelo
Para el entrenamiento de este modelo es muy sencillo, se utilizo el siguiente código:
~~~
def entrenamiento(metodo, data, labels):
    if metodo == 'Eigen':emociones_model = cv.face.EigenFaceRecognizer_create()
    if metodo == 'Fisher':emociones_model = cv.face.FisherFaceRecognizer_create()
    if metodo == 'LBPH':emociones_model = cv.face.LBPHFaceRecognizer_create()

    print("Entrenando modelo con el metodo " + metodo)
    inicio = time.time()
    emociones_model.train(data, np.array(labels))
    tiempoEntrenamiento = time.time() - inicio
    print("Modelo ya entrenado, se tardo: {}" .format(tiempoEntrenamiento))

    emociones_model.write("C:\\Users\\israe\\IA (Ahora si)\\Reconocedor de emociones\\ModelosReconocimientoEmociones\\modeloEmociones" + metodo +".xml")
        
dataPath = 'C:\\Users\\israe\\IA (Ahora si)\\Reconocedor de emociones\\DataSetEmociones'
emocionesList = os.listdir(dataPath)
print('Lista de personas: ', emocionesList)

metodo = "Eigen"
# metodo = "Fisher"
# metodo = "LBPH"

labels = []
facesData = []
label = 0

for nameDir in emocionesList:
	personPath = dataPath + '\\' + nameDir
	print('Leyendo las imágenes')

	for fileName in os.listdir(personPath):
		print('Rostros: ', nameDir + '\\' + fileName)
		labels.append(label)
		facesData.append(cv.imread(personPath+'\\'+fileName,0))
		
	label = label + 1

entrenamiento(metodo, facesData, labels)
~~~

donde se carga el dataSet creado anteriormente por medio de la ruta donde esta almacenado, el código es capaz de entrenar en 3 diferentes modelos como son:
1. EigenFace
2. FisherFace
3. LBPH

en este caso el metodo utilizado es el LBPH por su poca sensibilidad a la luz, pero sin ningún problema se puede entrenar cualquiera de los 3 de una forma tan fácil, existe una variable llamada __metodo__ la cual define que metodo usar, están los 3 en el código solo se necesita comentar las dos que no serán utilizadas, una vez entrenado el modelo termina por crear el archivo __.xml__ del metodo escogido.

## Probar modelo
A la hora de probar el metodo es muy sencillo utilizando un código que carga la lista de emociones por medio de la ruta del dataSet, de igual forma se usa la variable __metodo__ para escoger el metodo a utilizar según sea el que se tenga entrenado, luego procede a cargar el archivo __.xml__ que se entrenó previamente y se hace la predicción por medio de la cámara aunque perfectamente se podría probar por medio de un video, el código usado es el siguiente:
~~~
dataPath = 'C:\\Users\\israe\\IA (Ahora si)\\Reconocedor de emociones\\DataSetEmociones'
imagePaths = os.listdir(dataPath)
print('imagePaths=', imagePaths)

# metodo = "Eigen"
# metodo = "Fisher"
metodo = "LBPH"

if metodo == 'Eigen':
    emociones_model = cv.face.EigenFaceRecognizer_create()
if metodo == 'Fisher':
    emociones_model = cv.face.FisherFaceRecognizer_create()
if metodo == 'LBPH':
    emociones_model = cv.face.LBPHFaceRecognizer_create()

emociones_model.read("C:\\Users\\israe\\IA (Ahora si)\\Reconocedor de emociones\\ModelosReconocimientoEmociones\\modeloEmociones" + metodo + ".xml")

cap = cv.VideoCapture(0, cv.CAP_DSHOW)

faceClassif = cv.CascadeClassifier(cv.data.haarcascades + 'haarcascade_frontalface_default.xml')

while True:
    ret, frame = cap.read()
    if not ret:
        break
    gray = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)
    auxFrame = gray.copy()

    faces = faceClassif.detectMultiScale(gray, 1.3, 5)

    for (x, y, w, h) in faces:
        rostro = auxFrame[y:y + h, x:x + w]
        rostro = cv.resize(rostro, (150, 150), interpolation=cv.INTER_CUBIC)
        result = emociones_model.predict(rostro)

        cv.putText(frame, '{}'.format(result), (x, y - 5), 1, 1.3, (255, 255, 0), 1, cv.LINE_AA)

        # # EigenFaces
        if metodo == 'Eigen':
            if result[1] < 5700:
                cv.putText(frame, '{}'.format(imagePaths[result[0]]), (x, y - 25), 2, 1.1, (0, 255, 0), 1, cv.LINE_AA)
                cv.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
            else:
                cv.putText(frame, 'Desconocido', (x, y - 20), 2, 0.8, (0, 0, 255), 1, cv.LINE_AA)
                cv.rectangle(frame, (x, y), (x + w, y + h), (0, 0, 255), 2)

        # # FisherFace
        elif metodo == 'Fisher':
            if result[1] < 500:
                cv.putText(frame, '{}'.format(imagePaths[result[0]]), (x, y - 25), 2, 1.1, (0, 255, 0), 1, cv.LINE_AA)
                cv.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
            else:
                cv.putText(frame, 'Desconocido', (x, y - 20), 2, 0.8, (0, 0, 255), 1, cv.LINE_AA)
                cv.rectangle(frame, (x, y), (x + w, y + h), (0, 0, 255), 2)

        # LBPHFace
        if metodo == 'LBPH':
            if result[1] < 70:
                cv.putText(frame, '{}'.format(imagePaths[result[0]]), (x, y - 25), 2, 1.1, (0, 255, 0), 1, cv.LINE_AA)
                cv.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
            else:
                cv.putText(frame, 'Desconocido', (x, y - 20), 2, 0.8, (0, 0, 255), 1, cv.LINE_AA)
                cv.rectangle(frame, (x, y), (x + w, y + h), (0, 0, 255), 2)

    cv.imshow('frame', frame)
    k = cv.waitKey(1)
    if k == 27:
        break

cap.release()
cv.destroyAllWindows()
~~~

A la hora de detectar un rostro pintara un rectangulo alrededor del rostro, puede ser de dos tipos diferentes, verde o rojo:
- Verde: Significa que el modelo entrenado logró reconocer algún tipo de emoción.
- Rojo: EL modelo no logró detectar ningún tipo de emoción.

Por ultimo procedere a adjuntar el __.xml__ que generé cuando entrene mi modelo en una carpeta de Drive.

[Link](https://drive.google.com/drive/folders/1VTQRic5mL-CcavGaRG5k9LiD--y0BSbd?usp=sharing) de la carpeta de Drive que contiene el .xml resultante del entrenamiento.
