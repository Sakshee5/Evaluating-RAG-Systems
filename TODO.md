- maybe i dont need to save session id for the data models (think it thru)

- when i open the application, if file not found, then don't display the docs/question/configuration tab. Then only provide option to create a new session - working but still shows session id at hte top and 500 fetch request error
- if file available, pre-fill the documents, questions and configurations on the UI based on the retrieved session


- display config while displaying answers/qs
- maybe add a max of 3 configs
- shift to MongoDB for storage
- i havent tested with 1+ configs and 1+ questions together
- if i upload, delete and upload again, it doesnt show on the UI?