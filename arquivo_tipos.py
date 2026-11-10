def soma_com_print(a, b):
    resultado = a + b
    print(f"A soma de {a} e {b} é: {resultado}")
    return resultado

def soma_sem_print(a, b):
    resultado = a + b
    return resultado

if __name__ == "__main__":
    # Testando a função soma_com_print
    soma_com_print(3, 5)

    # Testando a função soma_sem_print
    resultado = soma_sem_print(10, 20)
    resultado
    #print(f"O resultado da soma sem print é: {resultado}")