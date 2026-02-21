pipeline {
    agent any
    environment {
        // --- ส่วนที่ต้องแก้ทุกครั้งที่ขึ้นโปรเจกต์ใหม่ ---
        PROJECT_NAME = 'pi5-nextjs-starter'
        HOST_PORT = '3001'
        HOST_ENV_PATH = "/home/symfy/projects/${PROJECT_NAME}/.env"
        // ---------------------------------------
        DISCORD_WEBHOOK = 'https://discord.com/api/webhooks/1474638647767859331/bHuss5jKHE4JZAG6sEf0rX72ksykDstkC1N-G3F2FJOg5zsK0exUPpyvC2EP-hUQaBTd'
    }
    stages {
        stage('Deploy') {
            steps {
                script {
                    // ดึงค่า .env จาก Host (Pi 5)
                    sh "cp ${env.HOST_ENV_PATH} .env || touch .env"
                    // รัน Docker Compose ด้วยตัวแปรจาก Jenkins
                    sh "PROJECT_NAME=${env.PROJECT_NAME} HOST_PORT=${env.HOST_PORT} docker compose up -d --build"
                    // ล้าง Image เก่าเพื่อประหยัดที่ SSD
                    sh "docker image prune -f"
                }
            }
        }
    }
    post {
        success { script { sendDiscord("✅ Success", 3066993) } }
        failure { script { sendDiscord("❌ Failed", 15158332) } }
    }
}

def sendDiscord(String status, int color) {
    def author = sh(script: "git log -1 --pretty=format:'%an'", returnStdout: true).trim()
    def msg = sh(script: "git log -1 --pretty=format:'%s'", returnStdout: true).trim()
    def hash = sh(script: "git rev-parse --short HEAD", returnStdout: true).trim()
    def json = "{\"embeds\":[{\"title\":\"${status}\",\"color\":${color},\"fields\":[{\"name\":\"Project\",\"value\":\"${env.PROJECT_NAME}\",\"inline\":true},{\"name\":\"Author\",\"value\":\"${author}\",\"inline\":true},{\"name\":\"Message\",\"value\":\"${msg}\"}]}]}"
    sh "curl -X POST -H 'Content-Type: application/json' -d '${json}' ${env.DISCORD_WEBHOOK}"
}
