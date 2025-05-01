from models.configuration import Configuration
from models.session import Session
import uuid

class ConfigurationService:
    @staticmethod
    def add_configuration(
        session_id: str,
        chunking_strategy: str,
        token_size: int = None,
        sentence_size: int = None,
        paragraph_size: int = None,
        page_size: int = None,
        embedding_model: str = None,
        similarity_metric: str = None,
        num_chunks: int = None
    ) -> Configuration:
        """Add a configuration to a session"""
        configuration = Configuration(
            id=str(uuid.uuid4()),
            session_id=session_id,
            chunking_strategy=chunking_strategy,
            token_size=token_size,
            sentence_size=sentence_size,
            paragraph_size=paragraph_size,
            page_size=page_size,
            embedding_model=embedding_model,
            similarity_metric=similarity_metric,
            num_chunks=num_chunks
        )

        try:
            with open(f"data/session_{session_id}.json", "r") as f:
                session = Session.model_validate_json(f.read())
                session.configurations.append(configuration)

            with open(f"data/session_{session_id}.json", "w") as f:
                f.write(session.model_dump_json(indent=4))

            return configuration
        except FileNotFoundError:
            raise ValueError(f"Session {session_id} not found")
        except Exception as e:
            raise ValueError(f"Failed to add configuration: {str(e)}")

    @staticmethod
    def delete_configuration(configuration_id: str, session_id: str) -> None:
        """Delete a configuration from a session"""
        try:
            with open(f"data/session_{session_id}.json", "r") as f:
                session = Session.model_validate_json(f.read())
                original_length = len(session.configurations)
                session.configurations = [config for config in session.configurations if config.id != configuration_id]
                
                if len(session.configurations) == original_length:
                    raise ValueError(f"Configuration {configuration_id} not found in session {session_id}")

            with open(f"data/session_{session_id}.json", "w") as f:
                f.write(session.model_dump_json(indent=4))
        except FileNotFoundError:
            raise ValueError(f"Session {session_id} not found")
        except Exception as e:
            raise ValueError(f"Failed to delete configuration: {str(e)}") 