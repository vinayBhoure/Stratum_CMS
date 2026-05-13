erDiagram

    USER ||--o{ PROJECT : has
    USER ||--o{ SKILL : has
    USER ||--o{ EXPERIENCE : has
    USER ||--|| CONTACT : has
    USER ||--o{ SOCIAL_ACCOUNT : has
    USER ||--|| RESUME : has

    PROJECT ||--o{ PROJECT_TAG : mapped
    TAG ||--o{ PROJECT_TAG : mapped

    PROJECT ||--o{ PROJECT_SKILL : uses
    SKILL ||--o{ PROJECT_SKILL : used_in

    EXPERIENCE ||--o{ EXPERIENCE_SKILL : uses
    SKILL ||--o{ EXPERIENCE_SKILL : used_in


    USER {
        uuid id PK
        string username
        string email
        string password
        string clerkId
    }

    PROJECT {
        uuid id PK
        uuid userId FK
        string title
        string description
        string mediaUrl
        string githubUrl
        string liveUrl
    }

    SKILL {
        uuid id PK
        uuid userId FK
        string name
    }

    EXPERIENCE {
        uuid id PK
        uuid userId FK
        string company
        string role
        date startDate
        date endDate
        string description
    }

    CONTACT {
        uuid id PK
        uuid userId FK
        string name
        string email
        string mobile
        string address
        string googleMapsUrl
    }

    SOCIAL_ACCOUNT {
        uuid id PK
        uuid userId FK
        string platform
        string url
    }

    RESUME {
        uuid id PK
        uuid userId FK
        string name
        string pdfUrl
        string updatedAt
    }

    TAG {
        uuid id PK
        string name
    }

    PROJECT_TAG {
        uuid id PK
        uuid projectId FK
        uuid tagId FK
    }

    PROJECT_SKILL {
        uuid id PK
        uuid projectId FK
        uuid skillId FK
    }

    EXPERIENCE_SKILL {
        uuid id PK
        uuid experienceId FK
        uuid skillId FK
    }