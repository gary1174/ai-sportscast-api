flowchart TD
    subgraph EntryPoints
        UI[Slack / Web UI]
        App[BirdDog App (Onboarding API)]
    end


    subgraph GatewayLayer
        APIGW[API Gateway]
        Auth[Auth Service]
    end


    subgraph CoreServices
        Orchestrator[AI Orchestration Service]
    end


    subgraph AIServices
        LLMProxy[LLM Proxy Service]
        RAG[RAG Engine]
    end


    subgraph ExternalLLMs
        OpenAI[OpenAI / Claude / Mistral]
    end


    subgraph DataSources
        VectorDB[Vector DB (Pinecone, Chroma)]
        MetadataDB[Property DB / Metadata]
    end


    %% Entry points
    UI --> APIGW
    App --> APIGW


    %% Gateway to Auth
    APIGW --> Auth


    %% Gateway to AI
    APIGW --> Orchestrator


    %% Orchestration flow
    Orchestrator --> LLMProxy
    Orchestrator --> RAG
    Orchestrator --> MetadataDB


    %% AI service calls
    LLMProxy --> OpenAI
    RAG --> VectorDB
    RAG --> MetadataDB