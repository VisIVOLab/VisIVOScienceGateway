import streamflow
import os
import json

# Funzione per eseguire il workflow
def run_simple_workflow():
    # Ottiene il percorso del file YAML
#    current_dir = os.path.dirname(os.path.abspath(__file__))
 #   workflow_file_path = os.path.join(current_dir, 'simple_test.yml')
   workflow_file_path = '/workflows/test2.yml'  
   print(f"--- Avvio del Workflow StreamFlow ---")
   print(f"Caricamento file: {workflow_file_path}")

  
        # Inizializza il Runner di StreamFlow
   runner = streamflow.Runner()
        
        # Esegue il workflow. Possiamo passare delle variabili extra qui,
        # ma per il test usiamo i valori di default nel YAML.
        
        # Nota: i risultati includono l'output finale e il log completo di tutti i passi.
   results = runner.run(workflow_file_path)
        
   print("\n--- RISULTATO FINALE DEL WORKFLOW ---")
        # Il risultato finale è l'array definito in 'final_output' nel YAML
   print(json.dumps(results['final_output'], indent=4))
        
   print("\n--- Log Dettagliato dei Passaggi ---")
        # Puoi ispezionare l'output di ogni singola fase, ad esempio:
   log_message = results['steps_output']['echo_hello']['log_message'].strip()
   print(f"Output di 'echo_hello': {log_message}")

   


# Esegui la funzione
if __name__ == "__main__":
    run_simple_workflow()


