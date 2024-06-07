# <center> Proyecto CNN de accidentes </center>

Este proyecto trata de crear una CNN capaz de identificar entre 5 diferentes tipos de accidentes:
- Incendios
- Inundaciones
- Tornados
- Asaltos
- Robos a casa habitación


## Crear DataSet

Lo primero era sacar el DataSet para la CNN para lo cual utilice videos y saque sus fotogramas ayudandome del siguiente código:

### Librerías:
~~~
import cv2 as cv
import os 
~~~
### Código:
~~~
# Directorio donde se almacenan los videos
video_paths = [
               'C:\\Users\\israe\\IA (Ahora si)\\Archivos\\Videos\\robos2\\r1.mp4',
               'C:\\Users\\israe\\IA (Ahora si)\\Archivos\\Videos\\robos2\\r2.mp4'
              ]

# Directorio donde se guardarán los fotogramas
output_dir = 'C:\\Users\\israe\\IA (Ahora si)\\Archivos\\Videos\\robos2\\Fotogramas\\'
os.makedirs(output_dir, exist_ok=True)

# Función para procesar un video
def process_video(video_path):
    cap = cv.VideoCapture(video_path)
    frame_count = 9597
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        output_path = os.path.join(output_dir, f'{os.path.basename(video_path)}{frame_count:04d}.jpg')
        cv.imwrite(output_path, frame)
        frame_count += 1
    cap.release()

# Bucle para procesar cada video en la lista
for video_path in video_paths:
    process_video(video_path)

print("Proceso terminado.")
~~~

Ya sacados los fotogramas los organice en 5 carpetas diferentes nombradas con cada respectivo accidente sacando un total de 47786 fotogramas:
- Incendios: 10,589 fotogramas.
- Inundaciones: 8,913 fotogramas.
- Asaltos: 10,441 fotogramas.
- RobosCasaHabitacion: 10,722 fotogramas.
- Tornados: 7,121 fotogramas.

Ya que saque todos los fotogramas tenía que redimenzionar todos los fotogramas para que tuvieran el mismo tamaño, en este caso yo escogí que fueran de 50x50 para esto se utiliza el siguiente código:

### Librerías:
~~~
import cv2 as cv
import os
~~~

### Código:
~~~
# Directorio de entrada donde se encuentran las imágenes originales
input_dir = 'C:\\Users\\israe\\IA (Ahora si)\\CNN de accidentes\\DataSetAccidentes\\RobosCasaHabitacion'

# Directorio de salida donde se guardarán las imágenes redimensionadas
output_dir = 'C:\\Users\\israe\\IA (Ahora si)\\CNN de accidentes\\DataSetAccidentes\\RobosCasa'
os.makedirs(output_dir, exist_ok=True)

# Lista de archivos en el directorio de entrada
file_list = os.listdir(input_dir)

# Contador para el nombre de los archivos de salida
output_count = 0
cont = 1

# Iterar sobre los archivos en el directorio de entrada
for i, filename in enumerate(file_list):
    # Esto es por si no quieres procesar todas las fotos puedes escoger que solo procese las imagenes multiplos de cierto número, en mi caso si procesaba todas
    if i % 1 == 0:
        # Ruta completa de la imagen de entrada
        input_path = os.path.join(input_dir, filename)
        # Lee la imagen
        image = cv.imread(input_path)
        if image is not None:
            # Redimensiona la imagen a 21x28
            resized_image = cv.resize(image, (50, 50))
            # Ruta completa de la imagen de salida
            output_path = os.path.join(output_dir, f'robo_{cont}.jpg')
            # Guarda la imagen redimensionada en el directorio de salida
            cv.imwrite(output_path, resized_image)
            output_count += 1
            cont += 1

print("Proceso completado.")
~~~

En mi caso prefería renombrar las imagenes para que tuvieran un mismo patrón con el siguiente código se puede realizar:

### Librerías:
~~~
import os
~~~
### Código:
~~~
# Ruta a la carpeta que contiene las imágenes
carpeta = 'C:\\Users\\israe\\IA (Ahora si)\\CNN de accidentes\\DataSetAccidentes\\RobosCasaHabitacion\\'
# Extensiones de imagen que quieres renombrar
extensiones = ('.jpg')
# Prefijo para los nuevos nombres de archivo
prefijo = 'robo_'
# Contador para los nuevos nombres
contador = 1

for nombre_archivo in os.listdir(carpeta):
    # Obtener la extensión del archivo
    extension = os.path.splitext(nombre_archivo)[1].lower()
    
    # Verificar si el archivo es una imagen
    if extension in extensiones:
        # Crear el nuevo nombre
        nuevo_nombre = f"{prefijo}{contador}.jpg"
        
        # Ruta completa del archivo original y del nuevo archivo
        ruta_antigua = os.path.join(carpeta, nombre_archivo)
        ruta_nueva = os.path.join(carpeta2, nuevo_nombre)
        
        # Renombrar el archivo
        os.rename(ruta_antigua, ruta_nueva)
        
        contador += 1

print("Renombrado completo.")
~~~

## Entrenamiento de la CNN

En el código proporcionado lo pricipal que cambie fue en la gran mayoría de variables que tenian la terminación __Deportes__ por __Accidentes__.

El siguiente cambio fue agregar la variable NClases que me sirvió en la configuración del modelo de entrenamiento:
~~~
y = np.array(labels)
X = np.array(images, dtype=np.uint8) #convierto de lista a numpy
# Find the unique numbers from the train labels
classes = np.unique(y)
nClasses = len(classes)
print('Total number of outputs : ', nClasses)
print('Output classes : ', classes)
~~~

Algo más que cambie fue la cantidad de epocas en las que se entrenara el modelo, cambie 43 epocas por 50 para entrenar un poco más y que mejorara la accuracy:
~~~
#declaramos variables con los parámetros de configuración de la red
INIT_LR = 1e-3 # Valor inicial de learning rate. El valor 1e-3 corresponde con 0.001
epochs = 50 # Cantidad de iteraciones completas al conjunto de imagenes de entrenamiento
batch_size = 64 # cantidad de imágenes que se toman a la vez en memoria
~~~

En la configuración del modelo principalmente cambie el tamaño de las imagenes en __input_shape:__ por el tamaño de las imagenes que yo use y en la capa __Dense__ cambie los parametros, en el primero coloque la variable __NClases__ para que el modelo contara con el mismo número de neuronas que de clases a predecir, en el segundo parametro cambie __sigmoide__ por __softmax__ para que pasara de binario a multiclase el modelo:
~~~
accidentes_model = Sequential()
accidentes_model.add(Conv2D(32, kernel_size=(3, 3),activation='linear',padding='same',input_shape=(50,50,3)))
accidentes_model.add(LeakyReLU(alpha=0.1))
accidentes_model.add(MaxPooling2D((2, 2),padding='same'))
accidentes_model.add(Dropout(0.5))

accidentes_model.add(Flatten())
accidentes_model.add(Dense(32, activation='linear'))
accidentes_model.add(LeakyReLU(alpha=0.1))
accidentes_model.add(Dropout(0.5))
accidentes_model.add(Dense(nClasses, activation='softmax'))
~~~

Por ultimo para predecir la imagen use el siguiente código:
### Librerías:
~~~
import cv2 as cv
import numpy as np
~~~
### Código:
~~~
from tensorflow.keras.preprocessing.image import img_to_array
from keras.models import load_model

# Cargar la imagen con OpenCV
accidentes_model = tf.keras.models.load_model("C:\\Users\\israe\\IA (Ahora si)\\CNN de accidentes\\accidentes2.keras")
img = cv.imread('C:\\Users\\israe\\IA (Ahora si)\\Archivos\\DataSetDeportes\\prueba\\casa.jpeg') #Robo a casa
imgAux = cv.resize(img, (50, 50))  # Ajustar el tamaño de la imagen
imgAux = cv.cvtColor(imgAux, cv.COLOR_BGR2RGB)
# Convertir la imagen a un array numpy
img_array = np.array(imgAux, dtype=np.uint8)
img_array = np.expand_dims(img_array, axis=0)


img_array = img_array.astype('float32')

img_array = img_array/255.
plt.imshow(img)


# Realizar la predicción
predicted_class = accidentes_model.predict(img_array)

clase_predicha = np.argmax(predicted_class)
print("Clase predicha:", accidentes[clase_predicha])
print("Clase predicha:", clase_predicha)
print("Probabilidades predichas:", predicted_class)
~~~

En la salida del código imprime a que clase predijo que pertenece la foto, el número correspondiente a esa clase, las probabilidades de todas las clases y por ultimo pinta la foto que se estaba utilizando.

Tambien modifique algunas partes del código que eran necesarias debido a la versión de las librerías que se utilizaron cuando se creo el archivo y las que se utilizaron a la hora de crear este proyecto ya que no eran la misma versión y ocasionaban algún conflicto. 

Agregue el archivo __.keras__ que resultó del entrenamiento. 

