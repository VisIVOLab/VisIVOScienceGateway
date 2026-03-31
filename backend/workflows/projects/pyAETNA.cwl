cwlVersion: v1.0
class: Workflow

inputs:
  conf: File
  data: File

outputs:
  outLog:
    type: File
    outputSource: elaborazione/logFile
  outPdf:
    type: File
    outputSource: elaborazione/pdfFile

steps:
  elaborazione:
    in:
      srcConf: conf
      srcData: data
    out: [logFile, pdfFile]
    run:
      class: CommandLineTool
      requirements:
        - class: EnvVarRequirement
          envDef:
            PYTHONPATH: "/mnt/beegfs/visivosg/programs/PyAETNA/:/home/visivosg/.local/lib/python3.11/site-packages"
        - class: InitialWorkDirRequirement
          listing:
            - $(inputs.srcConf)
            - $(inputs.srcData)

      baseCommand: ["python3.11", "/mnt/beegfs/visivosg/programs/PyAETNA/runPyAETNA.py"]

      # Passa i file come argomenti: runPyAETNA.py <conf> <data>
      arguments:
        - $(inputs.srcConf.path)
      inputs:
        srcConf: File
        srcData: File

      outputs:
        logFile:
          type: File
          outputBinding:
            glob: "PyAETNAouts/*.log"
        pdfFile:
          type: File
          outputBinding:
            glob: "PyAETNAouts/*.pdf"