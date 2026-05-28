from opcua import Server
import time
import random

# 1. Criar servidor
server = Server()

# 2. Endpoint
server.set_endpoint("opc.tcp://0.0.0.0:4840")

# 3. Namespace
uri = "http://ads.freeopcua.server"
idx = server.register_namespace(uri)

# 4. Objeto principal
objects = server.get_objects_node()
sensor = objects.add_object(idx, "Sensor")

# 5. Variáveis
temperature = sensor.add_variable(idx, "Temperature", 0.0)
pressure = sensor.add_variable(idx, "Pressure", 0.0)
running = sensor.add_variable(idx, "Running", False)

# 6. Permitir escrita externa
temperature.set_writable()
pressure.set_writable()
running.set_writable()

# 7. Subir servidor
server.start()
print("OPC-UA Server rodando em opc.tcp://localhost:4840")

try:
    while True:
        # Simulação de processo industrial
        temp_value = temperature.get_value()
        pres_value = pressure.get_value()
        run_value = running.get_value()

        temperature.set_value(temp_value)
        pressure.set_value(pres_value)
        running.set_value(run_value)
        
        output = {
            "Temperatura" : temperature.get_value(),
            "Pressão" : pressure.get_value(),
            "Status" : running.get_value(),
        }

        print(output)

        time.sleep(1)

finally:
    server.stop()
