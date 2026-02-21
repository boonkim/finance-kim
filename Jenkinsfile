pipeline {
    agent any
    environment {
        // --- ส่วนที่ต้องแก้ทุกครั้งที่ขึ้นโปรเจกต์ใหม่ ---
        PROJECT_NAME = 'fin-kim-wtf'
        HOST_PORT = '4242'
        HOST_ENV_PATH = "/home/symfy/projects/${PROJECT_NAME}/.env"
        // ---------------------------------------
        DISCORD_WEBHOOK = 'https://discord.com/api/webhooks/1474638647767859331/bHuss5jKHE4JZAG6sEf0rX72ksykDstkC1N-G3F2FJOg5zsK0exUPpyvC2EP-hUQaBTd'
    }
    stages {
        stage('Initialize & Notify') {
            steps {
                script {
                    def (a, m, h) = getGitInfo()
                    sendDiscordEmbed("🚀 Build เริ่มต้น", 3447003, a, m, h)
                }
            }
        }
        stage('Build & Deploy') {
            steps {
                script {
                    // ดึงค่า .env จาก Host (Pi 5)
                    sh "cp ${env.HOST_ENV_PATH} .env || touch .env"
                    // ลบ container เดิมโดยชื่อ
                    sh "docker rm -f ${env.PROJECT_NAME} 2>/dev/null || true"
                    sh 'docker compose down || true'
                    // รัน Docker Compose ด้วยตัวแปรจาก Jenkins
                    sh "PROJECT_NAME=${env.PROJECT_NAME} HOST_PORT=${env.HOST_PORT} docker compose up -d --build"
                    // ล้าง Image เก่าเพื่อประหยัดที่ SSD
                    sh "docker image prune -f"
                }
            }
        }
    }
    post {
        success {
            script {
                def (a, m, h) = getGitInfo()
                sendDiscordEmbed("✅ Build และ Deploy สำเร็จ", 3066993, a, m, h)
            }
        }
        failure {
            script {
                def (a, m, h) = getGitInfo()
                sendDiscordEmbed("❌ Build ล้มเหลว", 15158332, a, m, h)
            }
        }
    }
}

def getGitInfo() {
    def a = sh(script: "git log -1 --pretty=format:'%an'", returnStdout: true).trim()
    def m = sh(script: "git log -1 --pretty=format:'%s'", returnStdout: true).trim()
    def h = sh(script: "git rev-parse --short HEAD", returnStdout: true).trim()
    return [a, m, h]
}

def sendDiscordEmbed(String status, int color, String author, String commitMsg, String commitHash) {
    def timestamp = new Date().format("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", TimeZone.getTimeZone('UTC'))
    def jsonPayload = """
    {
      \"embeds\": [{
        \"title\": \"${status}\",
        \"color\": ${color},
        \"fields\": [
          { \"name\": \"Project\", \"value\": \"`${env.PROJECT_NAME}`\", \"inline\": true },
          { \"name\": \"Branch\", \"value\": \"`main`\", \"inline\": true },
          { \"name\": \"Author\", \"value\": \"${author}\", \"inline\": true },
          { \"name\": \"Commit\", \"value\": \"`${commitHash}`\", \"inline\": false },
          { \"name\": \"Message\", \"value\": \">>> ${commitMsg}\", \"inline\": false },
          { \"name\": \"Run Details\", \"value\": \"[ดูรายละเอียดใน Jenkins](${env.BUILD_URL})\", \"inline\": false }
        ],
        \"footer\": { \"text\": \"Jenkins CI/CD System • Pi 5\" },
        \"timestamp\": \"${timestamp}\"
      }]
    }
    """
    sh "curl -X POST -H 'Content-Type: application/json' -d '${jsonPayload.replaceAll("\n", " ")}' ${env.DISCORD_WEBHOOK}"
}
